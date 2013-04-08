//= require_self
//= require_tree ./templates
//= require_tree ./models
//= require_tree ./views
//= require_tree ./routers

Backbone.Marionette.Renderer.render = function(template, data) {
  return $(template).mustache(data);
}

var LiveEstimationPoker = new Backbone.Marionette.Application()

LiveEstimationPoker.addInitializer(function (options) {
  LiveEstimationPoker.pusher = new Pusher(options.pusherApiKey)
})

$('.game-page').each(function () {
  LiveEstimationPoker.start({pusherApiKey: $('input[name=pusher_api_key]').val()})
})

