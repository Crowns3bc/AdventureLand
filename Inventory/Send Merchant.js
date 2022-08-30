function send_merchant() {

	for (var i = 6; i < 20; i++) {
        if (character.items[i]) {
            send_item('CrownMerch', i, 9999);
            }
        }
	if (character.gold > 20000) {
        send_gold("CrownMerch", character.gold - 20000);
    }
}
