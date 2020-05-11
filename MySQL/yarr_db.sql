CREATE SCHEMA IF NOT EXISTS yarr;

CREATE TABLE IF NOT EXISTS `yarr`.`researchers` (
  `ResearcherId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `UserName` VARCHAR(45) NOT NULL,
  `HashedPassword` VARCHAR(45) NOT NULL,
  `FirstName` VARCHAR(45) NOT NULL,
  `LastName` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ResearcherId`));
  
CREATE TABLE IF NOT EXISTS `yarr`.`studies` (
  `StudyId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ResearcherId` INT UNSIGNED NOT NULL,
  `Title` VARCHAR(1024) NOT NULL,
  `StudyQuestions` VARCHAR(4096) NOT NULL,
  `Description` VARCHAR(4096) NOT NULL,
  PRIMARY KEY (`StudyId`),
  INDEX `ResearcherId_idx` (`ResearcherId` ASC) VISIBLE,
  CONSTRAINT `ResearcherId`
    FOREIGN KEY (`ResearcherId`)
    REFERENCES `yarr`.`researchers` (`ResearcherId`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);
	
CREATE TABLE `yarr`.`experiments` (
  `ExperimentId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `StudyId` INT UNSIGNED NOT NULL,
  `CreationDate` VARCHAR(45) NOT NULL,
  `Status` VARCHAR(45) NOT NULL,
  `Title` VARCHAR(45) NOT NULL,
  `Details` VARCHAR(4096) NOT NULL,
  `RoundsNumber` INT UNSIGNED NOT NULL,
  `RoundDuration` INT UNSIGNED NOT NULL,
  `Disability` INT UNSIGNED NOT NULL,
  `CharacterType` INT UNSIGNED NOT NULL,
  `ColorSettings` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`ExperimentId`),
  INDEX `StudyId_idx` (`StudyId` ASC) VISIBLE,
  CONSTRAINT `StudyId`
    FOREIGN KEY (`StudyId`)
    REFERENCES `yarr`.`studies` (`StudyId`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

CREATE TABLE `yarr`.`rounds` (
  `RoundId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ExperimentId` INT UNSIGNED NOT NULL,
  `RoundNumber` INT UNSIGNED NOT NULL,
  `GameMode` INT UNSIGNED NOT NULL,
  `Difficulty` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`RoundId`),
  INDEX `ExperimentId_idx` (`ExperimentId` ASC) VISIBLE,
  CONSTRAINT `ExperimentId`
    FOREIGN KEY (`ExperimentId`)
    REFERENCES `yarr`.`experiments` (`ExperimentId`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

CREATE TABLE `yarr`.`study_insights_mirror` (
  `ResearcherId` INT UNSIGNED NOT NULL,
  `StudyId` INT UNSIGNED NOT NULL,
  `AxisTime` DOUBLE NULL,
  `AxisEngagement` DOUBLE NULL,
  `BreakdownType` ENUM("mode", "skin", "difficultyType") NULL,
  `BreakdownName` VARCHAR(45) NOT NULL);

INSERT INTO yarr.study_insights_mirror (ResearcherId, StudyId, AxisTime, AxisEngagement, BreakdownType,BreakdownName)
VALUES (1,1,9,3,"mode","comp"),(1,1,12,3,"mode","comp"),(1,1,15,3,"mode","comp"),(1,1,18,5,"mode","comp"),(1,1,21,5,"mode","comp"),(1,1,24,3,"mode","comp"),
(1,1,9,1,"mode","coop"),(1,1,12,1,"mode","coop"),(1,1,15,1,"mode","coop"),(1,1,18,2,"mode","coop"),(1,1,21,3,"mode","coop"),(1,1,24,4,"mode","coop"),
(1,1,9,1,"skin","color"),(1,1,12,1,"skin","color"),(1,1,15,1,"skin","color"),(1,1,18,2,"skin","color"),(1,1,21,3,"skin","color"),(1,1,24,4,"skin","color"),
(1,1,9,1,"skin","shape"),(1,1,12,1,"skin","shape"),(1,1,15,1,"skin","shape"),(1,1,18,2,"skin","shape"),(1,1,21,3,"skin","shape"),(1,1,24,4,"skin","shape");


CREATE TABLE `yarr`.`study_insights_radar` (
  `ResearcherId` INT UNSIGNED NOT NULL,
  `StudyId` INT UNSIGNED NOT NULL,
  `ExperimentId` INT UNSIGNED NOT NULL,
  `ExperimentTitle` VARCHAR(45) NOT NULL,
  `HighestEngagement` DOUBLE NOT NULL,
  `MeanEngagement` DOUBLE NOT NULL,
  `MedianEngagement` DOUBLE NOT NULL,
  `ModeEngagement` DOUBLE NOT NULL,
  `RangeEngagement` DOUBLE NOT NULL,
  `RoundDuration` INT UNSIGNED NULL,
  `RoundsNumber` INT NULL,
  `RoundsAmountComp` INT NULL,
  `RoundsAmountCoop` INT NULL,
  `CharacterType` INT UNSIGNED NOT NULL,
  `Disability` INT UNSIGNED NOT NULL,
  `ColorSettings` INT UNSIGNED NOT NULL);

INSERT INTO yarr.study_insights_radar 
VALUES  (1,2,1,"Cooperative - Quadriplegia",            9,  6,4,6,8,180,3,0,3,1,2,1),
		(1,2,2,"Competitive - Quadriplegia",   10,  8,5,8,8,180,3,3,0,1,2,1),
		(1,2,3,"Cooperative - Color Blindness", 7,  4,4,4,4,180,3,0,3,2,3,3),
		(1,2,4,"Competitive - Color Blindness", 3,  2,2,2,2,180,3,3,0,2,3,3),
		(1,2,5,"Cooperative - No Disability",   8,  6,4,5,5,180,3,0,3,1,1,1),
		(1,2,6,"Competitive - No Disability",   10, 8,6,7,6,180,3,3,0,1,1,1);

CREATE TABLE `yarr`.`study_insights_mixed` (
  `ResearcherId` INT UNSIGNED NOT NULL,
  `StudyId` INT UNSIGNED NOT NULL,
  `ExperimentId` INT UNSIGNED NOT NULL,
  `ExperimentTitle` VARCHAR(45) NOT NULL,
  `TimeAxis` DOUBLE NULL,
  `Clicks` INT NOT NULL,
  `ResponseTime` DOUBLE NOT NULL,
  `DifficultyChange` INT NOT NULL);

INSERT INTO yarr.study_insights_mixed
VALUES (1,1,1,"Green-Red cBlindness",9, 20,0.2,0),
(1,1,1,"Green-Red cBlindness",12, 20,0.2,0 ),
(1,1,1,"Green-Red cBlindness",15,40,0.2,1 ),
(1,1,1,"Green-Red cBlindness",18,43,0.2,1 ),
(1,1,1,"Green-Red cBlindness",21,67,0.2,-1 ),
(1,1,1,"Green-Red cBlindness",24,65,0.2,0 ),
(1,1,2,"Green cBlindness",9,15,0.3, 0),
(1,1,2,"Green cBlindness",12,20,0.3, 0),
(1,1,2,"Green cBlindness",15,20,0.3, 0),
(1,1,2,"Green cBlindness",18,35,0.3, 1),
(1,1,2,"Green cBlindness",21,35,0.3, 1),
(1,1,2,"Green cBlindness",24,40,0.3, 0);

CREATE TABLE `yarr`.`study_insights_pie` (
  `ResearcherId` INT UNSIGNED NOT NULL,
  `StudyId` INT UNSIGNED NOT NULL,
  `Mode` VARCHAR(45) NOT NULL,
  `PercentItemsTaken` DOUBLE NULL,
  `PercentItemsMissed` DOUBLE NOT NULL,
  `PercentEnemiesAvoid` DOUBLE NOT NULL,
  `PercentEnemiesHit` DOUBLE NOT NULL,
  `PercentEnemiesBlock` DOUBLE NOT NULL);

INSERT INTO yarrs.study_insights_pie
VALUES (1,1,"comp",80,20,80,20,0),
(1,1,"coop",60,40,70,20,10);



CREATE TABLE `yarr`.`instances` (
  `ResearcherId` INT UNSIGNED NOT NULL,
  `StudyId` INT UNSIGNED NOT NULL,
  `ExperimentId` INT UNSIGNED NOT NULL,
  `InstanceId` INT UNSIGNED NOT NULL,
  `CreationTimestamp` float NOT NULL,
  `Status` enum('running','interrupted') NOT NULL,
  `DDAParity` BOOLEAN NOT NULL);