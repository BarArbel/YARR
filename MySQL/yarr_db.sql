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
