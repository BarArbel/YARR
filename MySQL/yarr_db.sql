CREATE SCHEMA IF NOT EXIST yarr;

CREATE TABLE IF NOT EXIST `yarr`.`researchers` (
  `ResearcherId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `UserName` VARCHAR(45) NOT NULL,
  `HashedPassword` VARCHAR(45) NOT NULL,
  `FirstName` VARCHAR(45) NOT NULL,
  `LastName` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ResearcherId`));
  
CREATE TABLE IF NOT EXIST `yarr`.`studies` (
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
  `Axis1` DOUBLE NULL,
  `Axis2` DOUBLE NULL,
  `Breakdown` ENUM("mode", "skin", "difficultyType") NULL,
  `EngagementLine1` DOUBLE NULL,
  `EngagementLine2` DOUBLE NULL,
  `EngagementLine3` DOUBLE NULL,
  `EngagementLine4` DOUBLE NULL,
  `EngagementLine5` DOUBLE NULL,
  `EngagementLine6` DOUBLE NULL,
  `EngagementLine7` DOUBLE NULL);CREATE TABLE `yarr`.`study_insights_mirror` (
  `ResearcherId` INT UNSIGNED NOT NULL,
  `StudyId` INT UNSIGNED NOT NULL,
  `Axis1` DOUBLE NULL,
  `Axis2` DOUBLE NULL,
  `Breakdown` ENUM("mode", "skin", "difficultyType") NULL,
  `EngagementLine1` DOUBLE NULL,
  `EngagementLine2` DOUBLE NULL,
  `EngagementLine3` DOUBLE NULL,
  `EngagementLine4` DOUBLE NULL,
  `EngagementLine5` DOUBLE NULL,
  `EngagementLine6` DOUBLE NULL,
  `EngagementLine7` DOUBLE NULL);

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

CREATE TABLE `yarr`.`study_insights_mixed` (
  `ResearcherId` INT UNSIGNED NOT NULL,
  `StudyId` INT UNSIGNED NOT NULL,
  `ExperimentId` INT UNSIGNED NOT NULL,
  `ExperimentTitle` VARCHAR(45) NOT NULL,
  `TimeAxis` DOUBLE NULL,
  `Clicks` INT NOT NULL,
  `ResponseTime` DOUBLE NOT NULL,
  `DifficultyChange` INT NOT NULL);

CREATE TABLE `yarr`.`study_insights_pie` (
  `ResearcherId` INT UNSIGNED NOT NULL,
  `StudyId` INT UNSIGNED NOT NULL,
  `Mode` VARCHAR(45) NOT NULL,
  `PercentItemsTaken` DOUBLE NULL,
  `PercentItemsMissed` DOUBLE NOT NULL,
  `PercentEnemiesAvoid` DOUBLE NOT NULL,
  `PercentEnemiesHit` DOUBLE NOT NULL,
  `PercentEnemiesBlock` DOUBLE NOT NULL);