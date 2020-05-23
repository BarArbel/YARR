from DB_connection import DBconnection
from difficulty_calc import DDAcalc
import socketio
import asyncio
import time
import os
import sys
from dotenv import load_dotenv

load_dotenv()
number_of_players = 3
starting_level = 2
last_time = None
sio = socketio.AsyncClient()
instance_id = ""
table_name = "DDA_Input_"
con = None
calc = None
host = os.getenv('HOST_SERVER')
recv_port = os.getenv('PORT_SERVER')


async def get_timestamp_and_gamemode():
    global con

    fetch = await con.get_timestamp()
    if fetch:
        timestamp = fetch[0]
    else:
        timestamp = 0

    fetch = await con.get_gamemode(timestamp)
    print(fetch)

    if fetch:
        gamemode = fetch[0]
    else:
        gamemode = None

    return timestamp, gamemode


async def get_data_from_db(timestamp, gamemode):
    global con, number_of_players

    total = {
        "pickupPlayerLimit": [],
        "pickupPlayerTotal": [],
        "pickupOther": [],
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
        "spawnPlayerItem": [],
        "spawnEnemy": []
    }

    for player_id in range(number_of_players):
        for event in total:
            temp_event = event
            temp_spawn_item_flag = False
            temp_player_flag = True

            if event == "pickupPlayerLimit":
                fetch = await con.count_last_pickup_events(player_id + 1, timestamp, 5)
            else:
                if event == "pickupPlayerTotal" or event == "pickupOther":
                    temp_event = "pickup"
                    if event == "pickupOther":
                        temp_player_flag = False
                elif event == "spawnPlayerItem" or event == "spawnEnemy":
                    temp_event = "spawn"
                    if event == "spawnPlayerItem":
                        temp_spawn_item_flag = True

                fetch = await con.count_total_player_events(temp_event, player_id + 1, timestamp, temp_spawn_item_flag,
                                                            temp_player_flag, gamemode)

            total[event].append(fetch[0])

    return total


def calculate(total, timestamp, gamemode):
    global con, calc, number_of_players

    calcs = {
        "penalty": [],
        "bonus": [],
        "skill": [],
        "level": []
    }

    group_level = 0

    for player_id in range(number_of_players):

        if gamemode == "Cooperative":
            penalty, bonus = calc.calc_penalty_and_bonus(total["pickupPlayerTotal"][player_id],
                                                         total["giveItem"][player_id],
                                                         total["revivePlayer"][player_id],
                                                         total["getDamaged"][player_id],
                                                         total["blockDamage"][player_id],
                                                         total["fallAccidently"][player_id])
        else:
            penalty, bonus = calc.calc_penalty_and_bonus(total["pickupPlayerTotal"][player_id], 0, 0,
                                                         total["getDamaged"][player_id], 0,
                                                         total["fallAccidently"][player_id])
        calcs["penalty"].append(penalty)
        calcs["bonus"].append(bonus)

        skill = calc.calc_skill(penalty, bonus, total["pickupPlayerTotal"][player_id],
                                total["spawnPlayerItem"][player_id])
        if skill is None:
            calcs["skill"].append(-1)
            calcs["level"].append(0)
            continue
        calcs["skill"].append(skill)

        level = calc.calc_difficulty(skill)
        calcs["level"].append(level)

        if gamemode == "Cooperative":
            player_level = calc.player_levels[player_id]
            if (level == 1 and player_level < 6) or (level == -1 and player_level > 1):
                calc.player_levels[player_id] += level
                con.timestamps[player_id] = timestamp

    if gamemode == "Competitive":
        current_level = calc.player_levels[0]
        sum_level = sum(calcs["level"])
        group_level = 1 if sum_level > 0 else (-1 if sum_level < 0 else 0)
        if (group_level == 1 and current_level < 6) or (group_level == -1 and current_level > 1):
            for player_id in range(number_of_players):
                calc.player_levels[player_id] += group_level
                con.timestamps[player_id] = timestamp

    return calcs, group_level


async def insert_calculations_to_db(calcs, group_level, timestamp, gamemode):
    global con, number_of_players

    for player_id in range(number_of_players):
        await con.insert_dda_table(player_id + 1, calcs["penalty"][player_id], calcs["bonus"][player_id],
                                   calcs["skill"][player_id], calcs["level"][player_id], timestamp)

    if gamemode == "Competitive":
        await con.insert_dda_table(0, 0.0, 0.0, 0.0, group_level, timestamp)


def create_game_json(calcs, group_level, gamemode):
    global con, number_of_players

    game_json = {
        "index": con.counter,
        "LevelSpawnHeightAndTimer": [],
        "LevelPrecision": [],
        "LevelSpeedAndSpawnRate": []
    }

    con.counter = con.counter + 1

    for player_id in range(number_of_players):
        if gamemode == "Cooperative":
            game_json["LevelSpawnHeightAndTimer"].append(calcs["level"][player_id])
            game_json["LevelPrecision"].append(calcs["level"][player_id])
            game_json["LevelSpeedAndSpawnRate"].append(calcs["level"][player_id])
        else:
            game_json["LevelSpawnHeightAndTimer"].append(group_level)
            game_json["LevelPrecision"].append(group_level)
            game_json["LevelSpeedAndSpawnRate"].append(group_level)

    return game_json


@sio.event
def connect():
    print('Connected successfully to data collector')
    sys.stdout.flush()


@sio.on("DDAupdate")
async def on_ddaupdate(data):
    global instance_id, table_name, last_time, starting_level

    print('DDAupdate received with ', data)
    sys.stdout.flush()

    if data == instance_id:
        current_time = time.time()
        if current_time > last_time + 5:
            last_time = current_time
            timestamp, gamemode = await get_timestamp_and_gamemode()
            print(timestamp, gamemode)
            sys.stdout.flush()
            if gamemode is not None:
                total = await get_data_from_db(timestamp, gamemode)
                print(total)
                sys.stdout.flush()
                calcs, group_level = calculate(total, timestamp, gamemode)
                print(calcs, group_level)
                sys.stdout.flush()
                await insert_calculations_to_db(calcs, group_level, timestamp, gamemode)
                game_json = create_game_json(calcs, group_level, gamemode)

                emit_json = {
                    "LvSettings": game_json,
                    "instanceId": instance_id
                }

                await sio.emit('LevelSettings', emit_json)
                print("data sent to server: ", emit_json)
                sys.stdout.flush()


@sio.on("gameEnded")
async def on_gameended(data):
    global instance_id, con

    print("gameEnded received with ", data)
    sys.stdout.flush()

    if data == instance_id:
        await con.insert_permanent_table(instance_id)
        await con.close_connection()
        print("dda closing")
        sys.stdout.flush()
        await sio.disconnect()


@sio.event
def disconnect():
    print('Disconnected from data collector')
    sys.stdout.flush()


async def init_vars(args):
    global instance_id, table_name, con, calc, number_of_players, last_time
    global starting_level

    instance_id = args[0]
    starting_level = int(args[1])
    number_of_players = int(args[2])

    table_name += instance_id
    con = DBconnection(table_name)
    await con.init_extender(number_of_players)
    if con.newT_continueF:
        levels = await con.get_levels(number_of_players)
    else:
        levels = []
    calc = DDAcalc(number_of_players, starting_level, levels)
    last_time = time.time()
    print("done init_vars")
    sys.stdout.flush()


async def start_server(args):
    global host, recv_port

    connected_to_server = False

    await init_vars(args)

    while not connected_to_server:
        try:
            await sio.connect("http://" + host + ":" + recv_port)
        except:
            print("Failed to connect to data collector, trying again")
            sys.stdout.flush()
        else:
            connected_to_server = True

    await sio.wait()


if __name__ == '__main__':
    print("hello ", sys.argv)
    sys.stdout.flush()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server(sys.argv[1:]))
    loop.close()
