function skills(){

    if (character.party()) {
        for (let char_name in party()) {
            let monster = get_nearest_monster({target: char_name});
            if (monster) {
                if (can_use("absorb")) {
                    use_skill("absorb", char_name);
                }
            }
        }
    }
}