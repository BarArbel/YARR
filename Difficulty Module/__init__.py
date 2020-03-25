from DB_connection import DB_connection
from difficulty_calc import DDA_calc


def calculate(con, numberOfPlayers):

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
    calcs = {
        "threshold": 0,
        "spawnHeightAndTimer": [],
        "precision": [],
        "speedAndSpawnRate": []
    }

    calc = DDA_calc()

    for player_id in range(numberOfPlayers):
        for event in total:
            total[event].append(con.count_total_player_events(event,
                                                              player_id))

    calcs["threshold"] = calc.calc_threshold(total["pickup"], total["spawn"])

    for player_id in range(numberOfPlayers):
        calcs["spawnHeightAndTimer"].append(calc.calc_spawn_height_and_timer(
            sum(total["pickup"]), total["fallAccidently"][player_id],
            total["failPickup"][player_id], total["pickup"][player_id],
            total["spawn"][player_id]))

        calcs["precision"].append(calc.calc_precision(
            total["avoidDamage"][player_id], total["getDamaged"][player_id],
            total["pickup"][player_id], total["spawn"][player_id]))

        calcs["speedAndSpawnRate"].append(calc.calc_speed_and_spawn_rate(
            total["avoidDamage"][player_id], total["getDamaged"][player_id],
            total["blockDamage"][player_id], total["pickup"][player_id],
            total["spawn"][player_id]))

    return calcs


if __name__ == '__main__':

    con = DB_connection("game_snapshot")
    con.create_DDA_table()

    for row in con.cursor:
        print(row)

    calcs = calculate(con, 3)
