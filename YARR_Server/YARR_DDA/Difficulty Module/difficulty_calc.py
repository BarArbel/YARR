class DDAcalc:

    def __init__(self, number_of_players, starting_level, levels):
        self.player_levels = []
        for i in range(number_of_players):
            self.player_levels.append(starting_level)
        # If levels isn't empty it means the game instance was interrupted and the player's levels aren't the
        # starting level.
        if len(levels) != 0:
            for i in range(number_of_players):
                self.player_levels[i] += levels[i]

    # Calculate penalty and bonus for a player.
    def calc_penalty_and_bonus(self, pickup_player_total, give_item, revive_player, get_damaged, block_damage):
        get_damaged_penalty = (0.4 * pickup_player_total) * get_damaged
        penalty = get_damaged_penalty

        give_item_bonus = (0.2 * pickup_player_total) * give_item
        revive_player_bonus = (0.2 * pickup_player_total) * revive_player
        block_damage_bonus = (0.01 * pickup_player_total) * block_damage
        bonus = give_item_bonus + revive_player_bonus + block_damage_bonus

        return round(penalty, 3), round(bonus, 3)

    # Calculate skill for a player
    def calc_skill(self, penalty, bonus, pickup_group, pickup_player_total, failed_pickup_player_total,
                   spawn_player_item, gamemode):
        # Wait for enough items to spawn for each player before calculating skill level for the player.
        if gamemode == "Cooperative" and pickup_player_total + failed_pickup_player_total < 3:
            return None
        # In competitive the items aren't specific to an individual player and failPickup event only happens when all
        # the players fail to pickup - so we look at the first items for the entire group.
        elif gamemode == "Competitive" and sum(pickup_group) + failed_pickup_player_total < 3:
            return None
        else:
            skill = round(pickup_player_total / spawn_player_item, 3)
            skill = float(skill * 100.0)
            skill = skill - penalty + bonus
            return skill

    # Calculate a player's difficulty change.
    def calc_difficulty(self, skill):
        range_max = 67
        range_min = 33

        return 1 if skill > range_max else (-1 if skill <= range_min else 0)
