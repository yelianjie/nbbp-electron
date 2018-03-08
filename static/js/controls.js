
var controls = function(){

}

controls.prototype.init = function(){
	this.initBg()
}

controls.prototype.initBg = function(){
	var flag = false
	$('body').mousemove(throttle(function(event) {
		if (!flag && event.screenX < 100) {
			flag = true
			$('#controls').addClass('show')
		}
		return false;
	}, 100))

	$('#controls').mouseleave(function(event) {
		if($(event.target).hasClass('click')) {
			return false;
		}
		$('.control').removeClass('active')
		$(this).find('.control-content').hide()
		$('#controls').removeClass('show')
		setTimeout(function(){
			flag = false
		},300)
		return false;
	});

	$('.control').hover(function() {
		$(this).addClass('active')
		$(this).find('.control-content').show()
		return false;
	}, function() {

	});

	/*$('.control-content').on('mouseleave',function(event){
		console.log('bridge over')
		event.preventDefault()
		$('.control-content').hide()
		$('.control').removeClass('active')
		return false
	})*/
}