LiveEstimationPoker.module("Results", function(Results, LiveEstimationPoker, Backbone, Marionette, $, _){
  Results.Player = Backbone.Model.extend({

  })

  Results.Players = Backbone.Collection.extend({
    model: Results.Player
  })

  Results.Game = Backbone.Model.extend({
    initialize: function () {
      _(this).bindAll()

      this.players = new Results.Players
      this.channelName = 'presence-' + this.get('room') + '-results'

      this.resultsChannel = LiveEstimationPoker.pusher.subscribe(this.channelName)
      this.resultsChannel.bind('pusher:subscription_succeeded', this.subscriptionSucceded)
      this.resultsChannel.bind('pusher:member_added', this.addPlayer)
      this.resultsChannel.bind('pusher:member_removed', this.removePlayer)
    },

    subscriptionSucceded: function (members) {
      members.each(this.addPlayer)
    },

    addPlayer: function (member) {
      var player = new Results.Player(_({}).extend(member.info, {id: member.id}))
      this.players.add(player)
    },

    removePlayer: function (member) {
      this.players.remove(member.id)
    },

    me: function () {
      return this.players.get(resultsChannel.members.me.id)
    }
  })

  Results.UserView = Marionette.ItemView.extend({
    template: '[data-template-name=user]',
    tagName: 'li',
    className: 'user'
  })

  Results.UsersView = Marionette.CollectionView.extend({
    itemView: Results.UserView,

    tagName: 'ul',
    className: 'users'
  })

  Results.MainView = Backbone.View.extend({
    initialize: function () {
      this.model = new Results.Game({ room: this.$('input[name=room]').val() })

      this.usersView = new Results.UsersView({ collection: this.model.players })
    },

    render: function () {
      this.usersView.render()
      this.$('.users-container').html(this.usersView.el)
    }
  })

  Results.addInitializer(function () {
    Results.mainView = new Results.MainView({ el: $('body') })
    Results.mainView.render()
  })
})