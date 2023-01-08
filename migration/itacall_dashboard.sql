-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Creato il: Nov 14, 2022 alle 00:33
-- Versione del server: 5.7.34
-- Versione PHP: 7.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `itacall_dashboard`
--
CREATE DATABASE IF NOT EXISTS `itacall_dashboard` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `itacall_dashboard`;

-- --------------------------------------------------------

--
-- Struttura della tabella `GeoPosition`
--

DROP TABLE IF EXISTS `GeoPosition`;
CREATE TABLE IF NOT EXISTS `GeoPosition` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `address` longtext,
  `appointmentId` int(11) DEFAULT NULL,
  `latitude` float NOT NULL,
  `longitude` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struttura della tabella `RevokedUserToken`
--

DROP TABLE IF EXISTS `RevokedUserToken`;
CREATE TABLE IF NOT EXISTS `RevokedUserToken` (
  `idAuthority` varchar(20) NOT NULL,
  `idByAuthority` varchar(50) NOT NULL,
  `token` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `RevokedUserToken`
--

INSERT INTO `RevokedUserToken` (`idAuthority`, `idByAuthority`, `token`) VALUES
('itacall', '19315400-1F20-4D89-9A2E-8579DF7CCA28', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZEF1dGhvcml0eSI6Iml0YWNhbGwiLCJpZEJ5QXV0aG9yaXR5IjoiMTkzMTU0MDAtMUYyMC00RDg5LTlBMkUtODU3OURGN0NDQTI4IiwiaWF0IjoxNjY2NzE2MzgzLCJleHAiOjE2OTgyNTIzODN9.beEtF35mcQj2bmm3N6ROxuLB0jK0d40wMqYYrU-u69I');

-- --------------------------------------------------------

--
-- Struttura della tabella `User`
--

DROP TABLE IF EXISTS `User`;
CREATE TABLE IF NOT EXISTS `User` (
  `idAuthority` varchar(20) NOT NULL,
  `idByAuthority` varchar(50) NOT NULL,
  `givenName` varchar(255) DEFAULT NULL,
  `familyName` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `assignedCampaignCommaIds` longtext,
  `assignedActivityCommaIds` longtext,
  `assignedVendorCommaIds` longtext,
  `assignedCampaignCommaNames` longtext,
  `assignedActivityCommaNames` longtext,
  `assignedVendorCommaNames` longtext,
  `assignedAppointmentsCommaIds` longtext,
  `role` enum('Superuser','Viewer') NOT NULL,
  PRIMARY KEY (`idByAuthority`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `User`
--

INSERT INTO `User` (`idAuthority`, `idByAuthority`, `givenName`, `familyName`, `username`, `email`, `password`, `assignedCampaignCommaIds`, `assignedActivityCommaIds`, `assignedVendorCommaIds`, `assignedCampaignCommaNames`, `assignedActivityCommaNames`, `assignedVendorCommaNames`, `assignedAppointmentsCommaIds`, `role`) VALUES
('itacall', '19315400-1F20-4D89-9A2E-8579DF7CCA28', NULL, NULL, 'test', 'test@itacall.com', '$2b$15$ZSGRqiJVB.9msqH9b3huL.IuZBOHs4fjOP9lkOaugAzYB2qWxwBne', '1789,1092', '4289,3177', '883,1031', NULL, NULL, NULL, NULL, 'Viewer'),
('itacall', '2D7790F5-4A61-4840-B21F-85E6D0BB7BA1', NULL, NULL, 'superitacalluser', 'noreply-admin@itacall.com', '$2b$15$5.p6JnWO0umjXuoBWxqRIOgJpug8GYzSnPcTA8OJb331vBxAMJiyS', NULL, NULL, '', NULL, NULL, NULL, NULL, 'Superuser'),
('itacall', 'ADDFD7BE-5C0E-4C2D-B73C-7168AB955E8E', NULL, NULL, '', 'alessandro.severa89@gmail.com', '$2b$15$GHz823tDGShVn59M70GuaOiiRGzlqruX5OwBWqGeb5/Bzaw/oNZ5O', '1789,1714,1198,1092', '4340,4289,4290,4021,3927,3894,3545,3353,3192,3193,3177', '9,883,1030,1031,1137,1206,1690,1905', 'ItaCall Rete Vendita,Itacall Covid-19,Itacall Ricerca UFF,ItaCall', 'Itacall Longhin,Itacall ReteVendita2,Itacall APP2,ItaCall Rete Vendita,Itacall Covid19 Enti,Itacall APP,Itacall TELE,Itacall Ricerca UFFICIO,ItaCall 2015 TOP Prospect 01,ItaCall 2015 TOP Prospect 02,ItaCall 2020', 'Andrea Bertollo,Levati Stefania,Di Nicola Laura,Itacall Commerciale,Itacall Commerciale TOP,Itacall Telefonici,Crema Melissa,Isabel Longhin', '', 'Viewer'),
('itacall', 'F6BE8253-FBE7-4C0F-B54A-1AC0BFF325C2', '', '', 'alessandro.severa@assist.it', 'alessandro.severa@assist.it', '$2b$15$l5fHn5geZFnnFUbhkfbXqeIsrd2ZafHx2B9Jc1sbJzngMrXwfkNDC', '1789,1714,1198,1092', '4340,4289', '9,883', 'ItaCall Rete Vendita,Itacall Covid-19,Itacall Ricerca UFF,ItaCall', 'Itacall Longhin,Itacall ReteVendita2', 'Andrea Bertollo,Levati Stefania', '', 'Viewer'),
('itacall', 'F8CDAB84-37E7-47D1-98BE-848347DFD3ED', 'Alessandro', 'Severa', 'alesev', 'alessandro.severa.1989@gmail.com', '$2b$15$3p50mT0gDff/pXoGL0IS/eGqxUNq4TarEvrH7yRCC4uscyIo.QFHm', '', '', '', '', '', '', '', 'Viewer');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
