from DB_connection import DB_connection
from difficulty_calc import DDA_calc


def calculate(con):

    total = {
        "pickup": [0, 0, 0],
        "giveItem": [0, 0, 0],
        "revivePlayer": [0, 0, 0],
        "temporaryLose": [0, 0, 0],
        "revived": [0, 0, 0],
        "lose": [0, 0, 0],
        "dropItem": [0, 0, 0],
        "getDamaged": [0, 0, 0],
        "avoidDamage": [0, 0, 0],
        "blockDamage": [0, 0, 0],
        "failPickup": [0, 0, 0],
        "fallAccidently": [0, 0, 0],
        "individualLoss": [0, 0, 0],
        "spawn": [0, 0, 0]
    }
    calcs = {
        "threshold": 0,
        "spawnHeightAndTimer": [0, 0, 0],
        "precision": [0, 0, 0],
        "speedAndSpawnRate": [0, 0, 0]
    }

    calc = DDA_calc()

    for player_id in range(3):
        for event in total:
            total[event][player_id] = con.count_total_player_events(
                event, player_id)

    calcs["threshold"][player_id] = calc.calc_threshold(total["pickup"],
                                                        total["spawn"])

    for player_id in range(3):
        calcs["spawnHeightAndTimer"][player_id] = calc.calc_spawn_height_and_timer(
            sum(total["pickup"]), total["fallAccidently"], total["failPickup"],
            total["pickup"][player_id], total["spawn"][player_id])

        calcs["precision"][player_id] = calc.calc_precision(
            total["avoidDamage"][player_id], total["getDamaged"][player_id],
            total["pickup"][player_id], total["spawn"][player_id])

        calcs["speedAndSpawnRate"][player_id] = calc.calc_speed_and_spawn_rate(
            total["avoidDamage"][player_id], total["getDamaged"][player_id],
            total["blockDamage"][player_id], total["pickup"][player_id],
            total["spawn"][player_id])

    return calcs


if __name__ == '__main__':

    con = DB_connection("game_snapshot")
    con.create_DDA_table()

    for row in con.cursor:
        print(row)

    calcs = calculate(con)
