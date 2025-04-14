-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 14 avr. 2025 à 08:54
-- Version du serveur : 8.2.0
-- Version de PHP : 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestepi`
--

-- --------------------------------------------------------

--
-- Structure de la table `controles`
--

DROP TABLE IF EXISTS `controles`;
CREATE TABLE IF NOT EXISTS `controles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `epiId` int NOT NULL,
  `userId` int NOT NULL,
  `dateControle` date NOT NULL,
  `statut` enum('Opérationnel','À réparer','Mis au rebut') NOT NULL,
  `commentaire` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `epiId` (`epiId`),
  KEY `userId` (`userId`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `controles`
--

INSERT INTO `controles` (`id`, `epiId`, `userId`, `dateControle`, `statut`, `commentaire`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, '2025-03-25', 'Opérationnel', 'testcom', '2025-04-12 19:17:46', '2025-04-13 11:31:01'),
(11, 10, 1, '2025-04-15', 'Opérationnel', 'Contrôle initial, aucune anomalie détectée', '2025-04-13 16:52:33', '2025-04-13 17:03:31'),
(3, 4, 1, '2025-04-10', 'À réparer', 'ggtest', '2025-04-12 22:25:30', '2025-04-13 11:31:06'),
(4, 1, 1, '2025-04-13', 'À réparer', 'comtest', '2025-04-12 23:15:51', '2025-04-13 12:58:16'),
(5, 4, 1, '2025-04-11', 'À réparer', 'testt', '2025-04-13 10:51:11', '2025-04-13 11:31:01'),
(6, 5, 1, '2025-02-04', 'À réparer', '4 fevrier 2025 epi marque 1v de type mousqueton est à réparer', '2025-04-13 11:45:31', '2025-04-13 11:45:31'),
(7, 6, 1, '2025-04-12', 'Opérationnel', 'Premier contrôle après mise en service, tout est parfait', '2025-04-13 12:18:34', '2025-04-13 12:40:30'),
(8, 6, 1, '2025-04-13', 'À réparer', 'Usure détectée, à vérifier lors du prochain contrôle', '2025-04-13 12:48:05', '2025-04-13 12:48:05'),
(10, 9, 1, '2025-04-14', 'Opérationnel', 'Contrôle initial suite à la mise en service', '2025-04-13 14:27:32', '2025-04-13 16:33:27'),
(12, 11, 1, '2025-03-27', 'À réparer', 'Gaine légèrement abrasée à 2m de l\'extrémité, à surveiller', '2025-04-13 16:57:48', '2025-04-13 20:23:00'),
(13, 10, 1, '2025-04-20', 'Opérationnel', 'Contrôle planifié', '2025-04-13 16:59:37', '2025-04-13 16:59:37'),
(14, 9, 1, '2025-12-27', 'Opérationnel', NULL, '2025-04-13 17:10:24', '2025-04-13 20:26:54');

-- --------------------------------------------------------

--
-- Structure de la table `epi`
--

DROP TABLE IF EXISTS `epi`;
CREATE TABLE IF NOT EXISTS `epi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identifiant` varchar(50) DEFAULT NULL,
  `marque` varchar(100) NOT NULL,
  `modele` varchar(100) NOT NULL,
  `numeroSerie` varchar(100) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `taille` varchar(20) DEFAULT NULL,
  `couleur` varchar(30) DEFAULT NULL,
  `dateAchat` date DEFAULT NULL,
  `dateFabrication` date DEFAULT NULL,
  `dateMiseEnService` date NOT NULL,
  `frequenceControle` int NOT NULL DEFAULT '12',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifiant` (`identifiant`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `epi`
--

INSERT INTO `epi` (`id`, `identifiant`, `marque`, `modele`, `numeroSerie`, `type`, `taille`, `couleur`, `dateAchat`, `dateFabrication`, `dateMiseEnService`, `frequenceControle`, `createdAt`, `updatedAt`) VALUES
(1, '1', 'NikeTest', 'ModelTest', 'FZSZ3I3D9UID', 'CORDE', '50', 'vert', '2025-04-01', '2025-04-03', '2025-04-12', 6, '2025-04-12 11:37:59', '2025-04-12 11:37:59'),
(4, '4', 'marqueEPI3', 'ModelTest3', 'FZSZ6I7D6UID', 'CASQUE', '22', 'orange', '2025-04-05', '2025-04-08', '2025-04-10', 11, '2025-04-12 22:03:27', '2025-04-13 11:08:46'),
(9, '10', 'Petzl', 'Vertex', 'VTX2025-001', 'CASQUE', 'Unique', 'Rouge', '2025-04-01', '2025-01-01', '2025-04-13', 6, '2025-04-13 14:26:53', '2025-04-13 14:26:53'),
(5, '6', 'EPIMarque1V', 'Modele1V', 'FZSV6I4D8UID', 'MOUSQUETON', '60', 'Marron', '2023-12-30', '2024-01-18', '2024-04-11', 1, '2025-04-13 11:44:29', '2025-04-13 11:58:01'),
(6, '7', 'ClimatePro', 'AlphaX-750', 'CP-2024-A750-001', 'MOUSQUETON', NULL, NULL, '2024-01-01', '2023-12-15', '2024-01-15', 1, '2025-04-13 12:17:58', '2025-04-13 12:47:21'),
(10, 'PETZL-VERTEX-001', 'PETZL', 'VERTEX 2023 PRO', 'SN202304-V001', 'CASQUE', NULL, NULL, '2023-04-15', '2023-04-01', '2025-03-15', 1, '2025-04-13 16:50:47', '2025-04-13 17:22:44'),
(11, 'BEAL-DP105-002', 'BEAL', 'DYNAMIC PRO 10.5', ' SN202307-C002 ', 'CORDE', NULL, NULL, '2023-07-10', '2023-06-15', '2025-03-15', 1, '2025-04-13 16:56:30', '2025-04-13 17:26:23');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `type` enum('ADMIN','MANAGER','USER') NOT NULL DEFAULT 'USER',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `firstName`, `lastName`, `email`, `password`, `phone`, `type`, `createdAt`, `updatedAt`) VALUES
(1, 'Admin', 'User', 'admin@example.com', '$2b$10$KlRFYBoF4UqBs2yWF8lFdO1zYn6VjYZe.cM5nkP9CUrvP0PsaQnGK', NULL, 'ADMIN', '2025-04-12 10:16:07', '2025-04-12 10:16:07');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
