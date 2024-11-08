const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors"); // Tambahkan ini

const app = express();
app.use(express.json());
app.use(cors()); // Tambahkan ini

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pwmysql",
    database: "db_puskesmas",
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected");
});

// Route dasar
app.get("/", (req, res) => {
    res.send("Welcome to the Login System API");
});

// Register
app.post("/register", (req, res) => {
    const {
        username,
        password,
        role,
        nik,
        nama_lengkap,
        umur,
        jenis_kelamin,
        alamat,
    } = req.body;

    // Hashing password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error("Hashing error:", err); // Logging error
            return res.status(500).send("Error in hashing password");
        }

        // Pastikan query SQL mencakup semua kolom yang diperlukan
        const query = `
            INSERT INTO users 
            (username, password, role, nik, nama_lengkap, umur, jenis_kelamin, alamat)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Eksekusi query dengan parameter yang lengkap
        db.query(
            query,
            [
                username,
                hash,
                role,
                nik,
                nama_lengkap,
                umur,
                jenis_kelamin,
                alamat,
            ],
            (err, result) => {
                if (err) {
                    console.error("Database error:", err); // Logging error
                    return res
                        .status(500)
                        .send("Database error: " + err.sqlMessage); // Sending error message
                }

                // Kirimkan response berhasil
                res.send("User registered successfully");
            }
        );
    });
});

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.status(401).send("User not found");
        bcrypt.compare(password, results[0].password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) return res.status(401).send("Incorrect password");
            const token = jwt.sign(
                { id: results[0].id, role: results[0].role },
                "secret",
                { expiresIn: "1h" }
            );
            res.json({ token, role: results[0].role });
        });
    });
});

// Endpoint untuk mendapatkan semua pasien
app.get("/pasien", (req, res) => {
    db.query("SELECT * FROM pasien", (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to retrieve patients" });
        } else {
            res.json(results);
        }
    });
});

// Fungsi untuk menghitung nomor antrian dan waktu periksa berdasarkan poli
function calculateQueueNumberAndTime(currentTime, poli) {
    return new Promise((resolve, reject) => {
        // Mendapatkan antrian terakhir pada poli yang diinginkan di hari yang sama
        const query = `
            SELECT nomor_antrian, waktu_periksa
            FROM pasien
            WHERE poli = ? AND DATE(waktu_periksa) = CURDATE()
            ORDER BY waktu_periksa DESC
            LIMIT 1;
        `;

        db.query(query, [poli], (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }

            let newQueueNumber = 1;
            let newQueueTime = new Date(currentTime);

            if (results.length > 0) {
                const lastQueue = results[0];
                newQueueNumber = lastQueue.nomor_antrian + 1;

                const lastQueueTime = new Date(lastQueue.waktu_periksa);
                const currentTimePlus10 = new Date(currentTime);
                currentTimePlus10.setMinutes(currentTime.getMinutes() + 10);

                // Cek apakah antrian sebelumnya + 30 menit lebih besar dari waktu sekarang + 10 menit
                if (lastQueueTime.getTime() + 30 * 60000 >= currentTimePlus10.getTime()) {
                    // Jika ya, waktu periksa pasien selanjutnya adalah 30 menit dari waktu periksa sebelumnya
                    newQueueTime = new Date(lastQueueTime.getTime() + 30 * 60000);
                } else {
                    // Jika tidak, waktu periksa pasien selanjutnya adalah 30 menit dari waktu sekarang
                    newQueueTime.setMinutes(currentTime.getMinutes() + 30);
                }
            } else {
                // Pasien pertama hari ini, waktu periksa ditambah 30 menit dari waktu sekarang
                newQueueTime.setMinutes(currentTime.getMinutes() + 30);
            }

            resolve({ newQueueNumber, newQueueTime });
        });
    });
}

// Endpoint untuk menambahkan pasien baru
app.post("/pasien", async (req, res) => {
    const { nik, nama_lengkap, poli, ...rest } = req.body;
    const currentTime = new Date();

    try {
        const { newQueueNumber, newQueueTime } = await calculateQueueNumberAndTime(currentTime, poli);

        const newPatient = {
            ...rest,
            nik,
            nama_lengkap,
            poli,
            nomor_antrian: newQueueNumber,
            waktu_periksa: newQueueTime,
        };

        db.query("INSERT INTO pasien SET ?", [newPatient], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Terjadi kesalahan saat menambahkan pasien" });
            } else {
                res.status(201).json({
                    message: "Pasien berhasil ditambahkan",
                    pasienId: results.insertId,
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding patient");
    }
});

// Endpoint untuk mendapatkan waktu periksa terbaru berdasarkan poli
app.get("/waktu-periksa/:poli", (req, res) => {
    const poli = req.params.poli;

    const query = `
        SELECT * FROM pasien
        WHERE poli = ?
        ORDER BY waktu_periksa DESC
        LIMIT 1;
    `;

    db.query(query, [poli], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
        } else if (results.length === 0) {
            res.status(404).json({ message: "Tidak ada pasien dengan poli tersebut" });
        } else {
            res.json(results[0]); // Mengembalikan data pasien dengan waktu periksa terbaru
        }
    });
});


// lama - Fungsi untuk menghitung nomor antrian dan waktu periksa
// function calculateQueueNumberAndTime(currentTime) {
//     return new Promise((resolve, reject) => {
//         db.query(
//             "SELECT MAX(nomor_antrian) AS last_queue_number FROM pasien",
//             (err, results) => {
//                 if (err) {
//                     console.error(err);
//                     reject(err);
//                     return;
//                 }

//                 const lastQueueNumber = results[0].last_queue_number || 0;
//                 const newQueueNumber = lastQueueNumber + 1;
//                 const newQueueTime = new Date(currentTime);
//                 newQueueTime.setMinutes(
//                     newQueueTime.getMinutes() + newQueueNumber + 30
//                 );

//                 resolve({ newQueueNumber, newQueueTime });
//             }
//         );
//     });
// }

// lama - Endpoint untuk menambahkan pasien baru
// app.post("/pasien", (req, res) => {
//     const { nik, nama_lengkap, ...rest } = req.body;
//     const currentTime = new Date();

//     calculateQueueNumberAndTime(currentTime)
//         .then(({ newQueueNumber, newQueueTime }) => {
//             const newPatient = {
//                 ...req.body,
//                 nomor_antrian: newQueueNumber,
//                 waktu_periksa: newQueueTime,
//             };


//     // const newPatient = {...req.body}
//             db.query(
//                 "INSERT INTO pasien SET ?",
//                 [newPatient],
//                 (err, results) => {
//                     if (err) {
//                         console.error(err);
//                         res.status(500).json({
//                             error: "Terjadi kesalahan saat menambahkan pasien",
//                         });
//                     } else {
//                         res.status(201).json({
//                             message: "Pasien berhasil ditambahkan",
//                             pasienId: results.insertId,
//                         });
//                     }
//                 }
//             );
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(500).send("Error adding patient");
//         });
// });

// Endpoint untuk mengambil data pasien berdasarkan username
app.get("/getPasienByUsername", (req, res) => {
    const { username } = req.query; // Ambil username dari query string atau parameter

    // Query SQL untuk mengambil data pasien berdasarkan username
    const query = `
        SELECT pasien.nik, pasien.nama_lengkap, pasien.umur, pasien.jenis_kelamin, pasien.alamat
        FROM pasien
        INNER JOIN users ON pasien.pendaftar = users.username
        WHERE users.username = ?
    `;

    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error fetching data" });
        }

        if (results.length === 0) {
            return res
                .status(404)
                .json({ message: "No data found for the given username" });
        }

        // Simpan hasil query ke dalam variabel
        const pasienData = results[0]; // Karena username harus unik, hanya ada satu hasil

        // Kirimkan data pasien sebagai respon
        res.status(200).json(pasienData);
    });
});

// Mengambil user berdasarkan username (GET)
app.get("/users/:username", (req, res) => {
    const { username } = req.params;
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error fetching user" });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(rows[0]);
    });
});

//  Endpoint untuk mengupdate data pasien berdasarkan ID
app.put("/pasien/:id", (req, res) => {
    const { id } = req.params;
    const {
        nik,
        nama_lengkap,
        jenis_kelamin,
        umur,
        alamat,
        poli,
        nomor_antrian,
    } = req.body;

    const query =
        "UPDATE pasien SET nik = ?, nama_lengkap = ?, jenis_kelamin = ?, umur = ?, alamat = ?, poli = ?, nomor_antrian = ? WHERE id = ?";
    db.query(
        query,
        [
            nik,
            nama_lengkap,
            jenis_kelamin,
            umur,
            alamat,
            poli,
            nomor_antrian,
            id,
        ],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                res.status(500).send("Error updating patient");
            } else {
                res.send("Patient updated successfully");
            }
        }
    );
});

// Endpoint DELETE untuk menghapus pasien berdasarkan id
app.delete("/pasien/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM pasien WHERE id = ?";
    db.query(query, [id], (error, results) => {
        if (error) {
            console.error("Error deleting patient:", error);
            return res.status(500).json({ message: "Error deleting patient" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({ message: "Patient deleted successfully" });
    });
});

// Endpoint untuk memeriksa apakah username atau nik sudah ada di database
app.post("/check-user", async (req, res) => {
    const { username, nik } = req.body;

    try {
        const query = `
            SELECT * FROM users
            WHERE username = ? OR nik = ?
        `;
        db.query(query, [username, nik], (error, results) => {
            if (error) {
                console.error("Error checking user:", error);
                return res
                    .status(500)
                    .json({ message: "Error checking user data" });
            }

            // Cek apakah username atau nik sudah ada
            const usernameExists = results.some(
                (user) => user.username === username
            );
            const nikExists = results.some((user) => user.nik === nik);

            res.json({ usernameExists, nikExists });
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error checking user data" });
    }
});

// Endpoint untuk mengambil data dengan role 'user'
app.get("/users", (req, res) => {
    const query = "SELECT * FROM users WHERE role = 'user'";

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error fetching data" });
        }
        res.json(results);
    });
});

// Endpoint untuk menghapus user berdasarkan ID
app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM users WHERE id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error deleting user" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    });
});

// Endpoint untuk mengupdate user berdasarkan ID
app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const {
        username,
        password,
        role,
        nik,
        nama_lengkap,
        umur,
        jenis_kelamin,
        alamat,
    } = req.body;

    const query = `
      UPDATE users 
      SET username = ?, password = ?, role = ?, nik = ?, nama_lengkap = ?, umur = ?, jenis_kelamin = ?, alamat = ? 
      WHERE id = ?
    `;

    db.query(
        query,
        [
            username,
            password,
            role,
            nik,
            nama_lengkap,
            umur,
            jenis_kelamin,
            alamat,
            id,
        ],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error updating user" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ message: "User updated successfully" });
        }
    );
});

// Endpoint untuk mendapatkan waktu periksa terbaru berdasarkan poli
app.get("/waktu-periksa/:poli", (req, res) => {
    const poli = req.params.poli;

    const query = `
        SELECT * FROM pasien
        WHERE poli = ?
        ORDER BY waktu_periksa DESC
        LIMIT 1;
    `;

    db.query(query, [poli], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
        } else if (results.length === 0) {
            res.status(404).json({ message: "Tidak ada pasien dengan poli tersebut" });
        } else {
            res.json(results[0]);  // Mengembalikan data pasien dengan waktu periksa terbaru
        }
    });
});

// Endpoint untuk mendapatkan waktu periksa terbaru untuk semua poli
app.get("/waktu-periksa", (req, res) => {
    const query = `
        SELECT * FROM pasien
        ORDER BY poli, waktu_periksa DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
        } else if (results.length === 0) {
            res.status(404).json({ message: "Tidak ada data pasien" });
        } else {
            // Mengelompokkan data berdasarkan poli dan mengambil waktu periksa terbaru
            const latestQueues = results.reduce((acc, curr) => {
                if (!acc[curr.poli] || new Date(acc[curr.poli].waktu_periksa) < new Date(curr.waktu_periksa)) {
                    acc[curr.poli] = curr;
                }
                return acc;
            }, {});

            res.json(Object.values(latestQueues));  // Mengembalikan data berdasarkan poli
        }
    });
});



app.listen(3000, () => {
    console.log("Server running on port 3000");
});
