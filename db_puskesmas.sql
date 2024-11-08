-- MariaDB dump 10.19  Distrib 10.11.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: db_puskesmas
-- ------------------------------------------------------
-- Server version	10.11.6-MariaDB-0+deb12u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `pasien`
--

DROP TABLE IF EXISTS `pasien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pasien` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nik` varchar(20) DEFAULT NULL,
  `nama_lengkap` varchar(100) DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `umur` int(11) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `poli` varchar(50) DEFAULT NULL,
  `nomor_antrian` int(11) DEFAULT NULL,
  `waktu_periksa` datetime DEFAULT NULL,
  `pendaftar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pasien`
--

LOCK TABLES `pasien` WRITE;
/*!40000 ALTER TABLE `pasien` DISABLE KEYS */;
INSERT INTO `pasien` VALUES
(25,'2309393','Shintya','Perempuan',21,'Pamulang Barat','gigi_dan_mulut',2,'2024-11-08 00:00:00','admin'),
(27,'22302803','Nadin Syila','Perempuan',23,'Pamulang Barat','ibu_dan_anak',4,'2024-11-08 06:15:32','nadin'),
(28,'22302803','Nadin Syila','Perempuan',23,'Pamulang Barat','umum',5,'2024-11-08 06:18:07','nadin'),
(33,'22302803','Nadin Syila','Perempuan',23,'Pamulang Barat','umum',6,'2024-11-08 06:48:07','nadin'),
(34,'22302803','Nadin Syila','Perempuan',23,'Pamulang Barat','gigi_dan_mulut',7,'2024-11-08 07:18:07','nadin'),
(36,'22302803','Nadin Syila','Perempuan',23,'Pamulang Barat','umum',9,'2024-11-08 08:18:07','nadin'),
(37,'22302803','Nadin Syila','Perempuan',23,'Pamulang Barat','umum',10,'2024-11-08 08:48:07','nadin'),
(39,'2300202','Bukan Raul','Laki-laki',24,'Ciputat','umum',12,'2024-11-08 09:48:07','bukanraul'),
(40,'2300202','Bukan Raul','Laki-laki',24,'Ciputat','umum',13,'2024-11-08 10:18:07','bukanraul'),
(41,'2300202','Bukan Raul','Laki-laki',24,'Ciputat','gigi_dan_mulut',3,'2024-11-08 06:52:07','bukanraul'),
(42,'2300202','Bukan Raul','Laki-laki',24,'Ciputat','gigi_dan_mulut',4,'2024-11-08 07:22:07','bukanraul'),
(43,'2300202','Bukan Raul','Laki-laki',24,'Ciputat','ibu_dan_anak',5,'2024-11-08 06:45:32','bukanraul'),
(44,'2300202','Bukan Raul','Laki-laki',24,'Ciputat','ibu_dan_anak',6,'2024-11-08 07:15:32','bukanraul'),
(45,'2300202','Bukan Raul','Laki-laki',24,'Ciputat','gigi_dan_mulut',5,'2024-11-08 07:52:07','bukanraul'),
(46,'2309212','Damai Sentosa','Laki-laki',38,'Pocis','umum',14,'2024-11-08 10:48:07','damai'),
(47,'2309212','Damai Sentosa','Laki-laki',38,'Pocis','umum',15,'2024-11-08 11:18:07','damai');
/*!40000 ALTER TABLE `pasien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin','doctor') DEFAULT NULL,
  `nik` varchar(20) DEFAULT NULL,
  `nama_lengkap` varchar(100) DEFAULT NULL,
  `umur` int(11) DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admin','$2a$10$qy6HRhPgmB.aHuUDhEXjBe27V9Nf4aA4j1XBiohFYCwyg5BIsKeQe','admin',NULL,NULL,NULL,NULL,NULL),
(6,'doctor','$2a$10$b8h7UIUzcKiY2FrX6plUfupECMcgdU03BkobzGTVHqVRlYg3/3dqi','doctor',NULL,NULL,NULL,NULL,NULL),
(24,'kesya','$2a$10$lGDSHA/QhTqQ69JniBmP3OZG5cfLCeGifB87dpDrp0oOCoUI.1sVm','user','2301928','Kesya Rashifa',22,'Perempuan','Pocis'),
(28,'damai','$2a$10$TNSNls1Xd7irM9vjFgnT..xCLKWMj/fjHCeHw/hm9GyfruMDKXBQm','user','2309212','Damai Sentosa',38,'Laki-laki','Pocis'),
(29,'bukanraul','$2a$10$akSjkHZxVcnl8oSx9bxTyunHwluXCRv85lgOWiQcbovrG72zEsanW','user','2301192','Bukan Eraul',24,'Laki-laki','Ciputat');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-08  8:19:51
