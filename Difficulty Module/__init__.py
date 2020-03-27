from DB_connection import DB_connection
from difficulty_calc import DDA_calc


def getDataFromDB(con, numberOfPlayers):

    total = {
        "pickup": [],
        "giveItem": [],
        "revivePlayer": [],
        "temporaryLose": [],
        "revived": [],
        "lose": [],
        "dropItem": [],
        "getDamaged": [],
        "avoidDamage": [],
        "blockDamage": [],
        "failPickup": [],
        "fallAccidently": [],
        "individualLoss": [],
        "spawn": []
    }

    lastSkills = {
        "I_SpawnHeight_skill": [],
        "E_Precision_skill": [],
        "E_Speed_skill": []
    }

    for player_id in range(numberOfPlayers):
        for event in total:
            total[event].append(con.count_total_player_events(
                event, player_id + 1))

        for skill in lastSkills:
            lastSkills[skill].append(con.get_DDA_last_player_skill(
                skill, player_id + 1))

    return total, lastSkills


def calculate(numberOfPlayers, total, lastSkills):

    calcs = {
        "threshold": 0,
        "spawnHeigthAndTimer": {
            "skill": [],
            "level": []
        },
        "precision": {
            "skill": [],
            "level": []
        },
        "speedAndSpawnRate": {
            "skill": [],
            "level": []
        }
    }

    key_pairs = [
        ["spawnHeigthAndTimer", "I_SpawnHeight_skill"],
        ["precision", "E_Precision_skill"],
        ["speedAndSpawnRate", "E_Speed_skill"]
    ]

    calc = DDA_calc()

    calcs["threshold"] = calc.calc_threshold(total["pickup"], total["spawn"])

    for player_id in range(numberOfPlayers):
        calcs["spawnHeightAndTimer"]["skill"].append(
            calc.calc_spawn_height_and_timer(
                sum(total["pickup"]), total["fallAccidently"][player_id],
                total["failPickup"][player_id], total["pickup"][player_id],
                total["spawn"][player_id]
            )
        )

        calcs["precision"]["skill"].append(
            calc.calc_precision(
                total["avoidDamage"][player_id],
                total["getDamaged"][player_id], total["pickup"][player_id],
                total["spawn"][player_id]
            )
        )

        calcs["speedAndSpawnRate"]["skill"].append(
            calc.calc_speed_and_spawn_rate(
                total["avoidDamage"][player_id],
                total["getDamaged"][player_id],
                total["blockDamage"][player_id], total["pickup"][player_id],
                total["spawn"][player_id]
            )
        )

        for pair in key_pairs:
            rangeMax = lastSkills[pair[1]] + calcs["threshold"]
            rangeMin = lastSkills[pair[1]] - calcs["threshold"]
            skill = calcs[pair[0]]["skill"][-1]

            calcs[pair[0]]["level"].append(1 if skill > rangeMax else (
                -1 if skill <= rangeMin else 0))

    return calcs


def insertCalculationsToDB(con, calcs):

    for player_id in range(numberOfPlayers):
        con.insert_DDA_table(player_id + 1, calcs["threshold"],
                             calcs["spawnHeightAndTimer"]["level"][player_id],
                             calcs["spawnHeightAndTimer"]["skill"][player_id],
                             calcs["spawnHeightAndTimer"]["level"][player_id],
                             calcs["spawnHeightAndTimer"]["skill"][player_id],
                             calcs["precision"]["level"][player_id],
                             calcs["precision"]["skill"][player_id],
                             calcs["speedAndSpawnRate"]["level"][player_id],
                             calcs["speedAndSpawnRate"]["skill"][player_id],
                             calcs["speedAndSpawnRate"]["level"][player_id],
                             calcs["speedAndSpawnRate"]["skill"][player_id])
    return


if __name__ == '__main__':

    numberOfPlayers = 3
    con = DB_connection("game_snapshot", numberOfPlayers)
    con.create_DDA_table()

    total, lastSkills = getDataFromDB(con, numberOfPlayers)
    calcs = calculate(numberOfPlayers, total, lastSkills)
    insertCalculationsToDB(con, calcs)
