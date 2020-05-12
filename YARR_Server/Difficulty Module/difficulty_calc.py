
# ----------------------


class DDA_calc:

    def __init__(self, number_of_players, starting_level):
        self.player_levels = []
        for i in range(number_of_players):
            self.player_levels.append(starting_level)

    def calc_penalty_and_bonus(self, pickup_player_total, give_item,
                               revive_player, get_damaged, block_damage,
                               fall_accidently):

        get_damaged_penalty = (0.4 * pickup_player_total) * get_damaged
        fall_accidently_penalty = (0.01 * pickup_player_total) * fall_accidently
        penalty = get_damaged_penalty #+ fall_accidently_penalty

        give_item_bonus = (0.2 * pickup_player_total) * give_item
        revive_player_bonus = (0.2 * pickup_player_total) * revive_player
        block_damage_bonus = (0.01 * pickup_player_total) * block_damage
        bonus = give_item_bonus + revive_player_bonus + block_damage_bonus

        return round(penalty, 3), round(bonus, 3)

    def calc_skill(self, penalty, bonus, pickup_player_total, spawn_player_item):
        if spawn_player_item < 3:
            return None
        else:
            skill = round(pickup_player_total / spawn_player_item, 3)
            skill = float(skill * 100.0)
            skill = skill - penalty + bonus
            return skill

    def calc_difficulty(self, skill):
        rangeMax = 66
        rangeMin = 33

        return 1 if skill > rangeMax else (-1 if skill <= rangeMin else 0)
