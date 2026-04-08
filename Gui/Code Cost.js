const CCMETER = (() => {
	let lastCC = 0;
	const $ = parent.$;

	$('#bottommid').find('#ccmeter').remove();
	$('#bottommid').children().first().after(
		$('<div id="ccmeter">').css({width:'50%',margin:'0 auto',fontSize:'15px',color:'white',textAlign:'center'}).append(
			$(`<div style="position:relative;width:100%;height:15px;border:4px solid gray;background:green">
        <div id="ccmeterfill" style="position:absolute;left:0;top:0;height:100%;background:red"></div>
        <div id="ccmetertext" style="position:absolute;width:100%;height:100%;line-height:15px;color:#FFD700;text-align:center;pointer-events:none"></div>
      </div>`)
		)
	);

	const update = () => {
		const cc = character.cc || 0;
		if (cc !== lastCC) {
			$('#ccmeterfill').css('width', `${Math.min(100, Math.floor(cc/180*100))}%`);
			$('#ccmetertext').text(`${Math.floor(cc)} / 180`);
			lastCC = cc;
		}
	};

	setInterval(update, 250);
	return {update};
})();
