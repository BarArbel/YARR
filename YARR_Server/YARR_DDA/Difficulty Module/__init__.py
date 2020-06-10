from DB_connection import DBconnection
from difficulty_calc import DDAcalc
import socketio
import asyncio
import time
import sys
import threading

number_of_players = 3
starting_level = 2
last_time = None
sio = socketio.AsyncClient()
instance_id = ""
table_name = "dda_input_"
con = None
calc = None
time_lock = threading.Lock()
count_lock = threading.Lock()


# Get the timestamp and game mode of the last game event.
async def get_timestamp_and_gamemode():
    global con

    fetch = await con.get_timestamp_gamemode()
    if fetch:
        timestamp = fetch[0]
        gamemode = fetch[1]
    else:
        timestamp = None
        gamemode = None

    return timestamp, gamemode


# Checks if game mode is competitive, and if so - makes sure all the player levels are the same.
def check_gamemode_and_levels(timestamp, gamemode):
    global con, calc, number_of_players

    if gamemode == "Competitive":
        level = calc.player_levels[0]
        are_different = False

        for i in range(1, number_of_players):
            if level != calc.player_levels[i]:
                are_different = True
                break

        # If player levels are different it means we are at the start of a competitive round.
        # The new player levels will be an average of the current levels.
        if are_different:
            level = int(sum(calc.player_levels) / number_of_players)
            if level < 1:
                level = 1
            elif level > 6:
                level = 6

            for i in range(number_of_players):
                calc.player_levels[i] = level
                con.timestamps[i] = timestamp


# Counts the total occurrences of game events for each player.
# The time frame to check for each player is from the last timestamp the player's level changed.
async def get_data_from_db(timestamp, gamemode):
    global con, number_of_players

    total = {
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

            if fetch == -1:
                return None
            else:
                total[event].append(fetch[0])

    return total


# Calculate a level change for each player in cooperative mode, or a group level in competitive.
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

        # Calculate player penalty and bonus
        if gamemode == "Cooperative":
            penalty, bonus = calc.calc_penalty_and_bonus(total["pickupPlayerTotal"][player_id],
                                                         total["giveItem"][player_id],
                                                         total["revivePlayer"][player_id],
                                                         total["getDamaged"][player_id],
                                                         total["blockDamage"][player_id])
        else:
            penalty, bonus = calc.calc_penalty_and_bonus(total["pickupPlayerTotal"][player_id], 0, 0,
                                                         total["getDamaged"][player_id], 0)
        calcs["penalty"].append(penalty)
        calcs["bonus"].append(bonus)

        # Calculate player skill
        skill = calc.calc_skill(penalty, bonus, total["pickupPlayerTotal"][player_id], total["failPickup"][player_id],
                                total["spawnPlayerItem"][player_id])
        # If skill is None it means not enough data as been collected yet for the player.
        # Set the player level to stay as it is now - 0.
        if skill is None:
            calcs["skill"].append(-1)
            calcs["level"].append(0)
            continue
        calcs["skill"].append(skill)

        # Calculate player difficulty change.
        # Increase level by 1, decrease level by 1, or keep current level - 0.
        level = calc.calc_difficulty(skill)
        calcs["level"].append(level)

        # If game mode is cooperative then levels are personal for each player.
        # Set the player's new level.
        if gamemode == "Cooperative":
            player_level = calc.player_levels[player_id]
            if (level == 1 and player_level < 6) or (level == -1 and player_level > 1):
                calc.player_levels[player_id] += level
            # If the player's level was changed remember the timestamp for that player.
            if level != 0:
                con.timestamps[player_id] = timestamp

    # If game mode is competitive then difficulty level is the same for all players.
    # Calculate group level.
    if gamemode == "Competitive":
        current_level = calc.player_levels[0]
        count_levels = {
            "1": 0,
            "0": 0,
            "-1": 0
        }

        # Count the number of player for each difficulty level change.
        for i in range(number_of_players):
            count_levels[str(calcs["level"][i])] += 1
        # If more players should stay at the current level rather than lowering or increasing it then keep the
        # current level.
        # Else - calculate the group level by summing all the player's level changes.
        # If the sum is positive - more players require an increase in difficulty.
        # If the sum is negative - more players require a decrease in difficulty.
        if count_levels["0"] > count_levels["1"] and count_levels["0"] > count_levels["-1"]:
            group_level = 0
        else:
            sum_level = sum(calcs["level"])
            group_level = 1 if sum_level > 0 else (-1 if sum_level < 0 else 0)

        if (group_level == 1 and current_level < 6) or (group_level == -1 and current_level > 1):
            for player_id in range(number_of_players):
                calc.player_levels[player_id] += group_level
        # If the group level was changed - remember the timestamp for all players.
        if group_level != 0:
            for player_id in range(number_of_players):
                con.timestamps[player_id] = timestamp

    return calcs, group_level


# Insert the calculations to the DB.
async def insert_calculations_to_db(calcs, group_level, timestamp, gamemode):
    global con, number_of_players

    # The calculations for each individual player.
    for player_id in range(number_of_players):
        await con.insert_dda_table(player_id + 1, calcs["penalty"][player_id], calcs["bonus"][player_id],
                                   calcs["skill"][player_id], calcs["level"][player_id], timestamp)

    # For competitive mode insert another row for the group level.
    if gamemode == "Competitive":
        await con.insert_dda_table(0, 0.0, 0.0, 0.0, group_level, timestamp)


# Build the json format to send back to the game.
def create_game_json(calcs, group_level, gamemode):
    global con, number_of_players

    count_lock.acquire()
    game_json = {
        "index": con.counter,
        "LevelSpawnHeightAndTimer": [],
        "LevelPrecision": [],
        "LevelSpeedAndSpawnRate": []
    }
    con.counter = con.counter + 1
    count_lock.release()

    # In cooperative mode the levels are individual.
    # In competitive mode the changes for all the players have the same level and change together.
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


# New data was added to the DB
@sio.on("DDAupdate")
async def on_ddaupdate(data):
    global instance_id, table_name, last_time, starting_level

    print('DDAupdate received with ', data)
    sys.stdout.flush()

    # Make sure the data was meant for the current DDA instance.
    if data == instance_id:
        current_time = time.time()
        # Check if enough time has passed since the last difficulty calculation.
        time_lock.acquire()
        if current_time > last_time + 5:
            last_time = current_time
            time_lock.release()
            # Get the current timestamp and game mode.
            timestamp, gamemode = await get_timestamp_and_gamemode()
            print("timestamp: {0}, gamemode: {1}".format(timestamp, gamemode))
            sys.stdout.flush()
            # If the game mode is None there was a problem when retrieving data from the DB.
            if gamemode is not None:
                print("entered with timestamp: ", timestamp)
                sys.stdout.flush()
                # Check if the game as entered to competitive mode - and if so make sure all player levels are the same.
                check_gamemode_and_levels(timestamp, gamemode)
                # Get dada from the DB.
                total = await get_data_from_db(timestamp, gamemode)
                print(total)
                sys.stdout.flush()
                if total is not None:
                    # Calculate difficulty level change.
                    calcs, group_level = calculate(total, timestamp, gamemode)
                    print(calcs, group_level)
                    sys.stdout.flush()
                    # Insert calculations to DB.
                    await insert_calculations_to_db(calcs, group_level, timestamp, gamemode)
                    # Build json formt to send to game.
                    game_json = create_game_json(calcs, group_level, gamemode)

                    emit_json = {
                        "LvSettings": game_json,
                        "instanceId": instance_id
                    }

                    # Send json back to server to be deliverd to the game.
                    await sio.emit('LevelSettings', emit_json)
                    print("data sent to server: ", emit_json)
                    sys.stdout.flush()
        else:
            time_lock.release()


@sio.on("gameEnded")
async def on_gameended(data):
    global instance_id, con

    print("gameEnded received with ", data)
    sys.stdout.flush()

    # If my game instance as ended
    if data == instance_id:
        # Transfer all the calculations data to a permanent table in the platform's DB.
        await con.insert_permanent_table(instance_id)
        # Close DB connection and delete temporary tables in the DDA DB.
        await con.close_connection()
        print("dda closing")
        sys.stdout.flush()
        # Close connection to server.
        await sio.disconnect()


@sio.event
def disconnect():
    print('Disconnected from data collector')
    sys.stdout.flush()


# Init global vars
async def init_vars(args):
    global instance_id, table_name, con, calc, number_of_players, last_time
    global starting_level

    instance_id = args[0]
    starting_level = int(args[1])
    number_of_players = int(args[2])

    table_name += instance_id
    con = DBconnection(table_name)
    await con.init_extender(number_of_players)
    # Check is the game instance is a new one or an interrupted one
    if con.newT_continueF:
        # If the instance is a game continuation calculate the player levels.
        levels = await con.get_levels(number_of_players)
    else:
        levels = []
    calc = DDAcalc(number_of_players, starting_level, levels)
    last_time = time.time()
    print("done init_vars")
    sys.stdout.flush()


# Main loop for the DDA
async def start_server(args):
    connected_to_server = False

    await init_vars(args)

    # Connected to DDA server.
    while not connected_to_server:
        try:
            await sio.connect("https://yarr-dda.herokuapp.com/")
            # await sio.connect("http://127.0.0.1:52300")
        except:
            print("Failed to connect to data collector, trying again")
            sys.stdout.flush()
        else:
            connected_to_server = True

    # Wait for events.
    await sio.wait()


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server(sys.argv[1:]))
    loop.close()
