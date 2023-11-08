function send_merchant() {

	for (var i = 0; i < 41; i++) {
        if (character.items[i]) {
            send_item('CrownMerch', i, 9999);
            }
        }
	if (character.gold > 10000) {
        send_gold("CrownMerch", character.gold - 20000);
    }
}
