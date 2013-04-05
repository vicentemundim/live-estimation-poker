//= require_self
//= require_tree ./templates
//= require_tree ./models
//= require_tree ./views
//= require_tree ./routers

var LiveEstimationPoker = new Backbone.Marionette.Application()

LiveEstimationPoker.addInitializer(function (options) {
  LiveEstimationPoker.pusher = new Pusher(options.pusherApiKey)
})

$(function () {
  LiveEstimationPoker.start({pusherApiKey: $('input[name=pusher_api_key]').val()})
})

