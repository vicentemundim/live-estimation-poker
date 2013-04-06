LiveEstimationPoker.module("Results", function(Results, LiveEstimationPoker, Backbone, Marionette, $, _){
  Results.Room = Backbone.Model.extend({

  })

  Results.Player = Backbone.Model.extend({

  })

  Results.Players = Backbone.Collection.extend({
    model: Results.Player
  })

  Results.Card = Backbone.Model.extend({
    initialize: function () {
      this.on('change:selected', this.onSelectedChange, this)
    },

    onSelectedChange: function (model, value) {
      if (this.collection && value) {
        this.collection.selected(this)
      }
    }
  })

  Results.Cards = Backbone.Collection.extend({
    model: Results.Card,

    selected: function (selectedCard) {
      this.each(function (card) {
        if (card !== selectedCard) {
          card.set({selected: false})
        }
      }, this)

      this.trigger('selected', selectedCard)
    }
  })

  Results.PlayerCard = Backbone.Model.extend({

  })

  Results.PlayerCards = Backbone.Collection.extend({
    model: Results.PlayerCard
  })

  Results.Game = Backbone.Model.extend({
    initialize: function () {
      _(this).bindAll()

      this.players = new Results.Players
      this.cards   = new Results.Cards
      this.selectedPlayerCards = new Results.PlayerCards

      _(this.get('room').get('cards')).map(function (rawCard) {
        this.cards.add(new Results.Card({ value: rawCard }))
      }, this)

      this.listenTo(this.cards, 'selected', this.onCardSelected, this)

      this.channelName = 'presence-' + this.get('room').get('token') + '-results'

      this.resultsChannel = LiveEstimationPoker.pusher.subscribe(this.channelName)
      this.resultsChannel.bind('pusher:subscription_succeeded', this.subscriptionSucceded)
      this.resultsChannel.bind('pusher:member_added', this.addPlayer)
      this.resultsChannel.bind('pusher:member_removed', this.removePlayer)
      this.resultsChannel.bind('client-card-selected', this.otherPlayerSelectedCard)
    },

    subscriptionSucceded: function (members) {
      members.each(this.addPlayer)
    },

    addPlayer: function (member) {
      var isMe       = member.id == this.resultsChannel.members.me.id,
          attributes = _({}).extend(member.info, {id: member.id, isMe: isMe}),
          player     = new Results.Player(attributes)

      this.players.add(player)
    },

    removePlayer: function (member) {
      this.players.remove(member.id)
    },

    me: function () {
      this._me = this._me || this.players.get(this.resultsChannel.members.me.id)
      return this._me
    },

    start: function () {
      this.selectedPlayerCards.reset()
      this.set({status: 'started'})
    },

    onCardSelected: function (card) {
      this.me().set('card', card.get('value'))
      this.selectedPlayerCards.add(this.me().toJSON(), {merge: true})
      this.resultsChannel.trigger('client-card-selected', this.me().toJSON())
    },

    otherPlayerSelectedCard: function (playerWithCard) {
      var player = this.players.get(playerWithCard.id)

      player.set(playerWithCard)
      this.selectedPlayerCards.add(playerWithCard, {merge: true})
    }
  })

  Results.UserView = Marionette.ItemView.extend({
    template: '[data-template-name=user]',
    tagName: 'li',
    className: 'user',

    onRender: function () {
      if (this.model.get('isMe')) {
        this.$el.addClass('me')
      }
    }
  })

  Results.UsersView = Marionette.CollectionView.extend({
    itemView: Results.UserView,

    tagName: 'ul',
    className: 'users',

    onRender: function () {
      this.$el.tooltip({ selector: '[data-toggle=tooltip]' })
    }
  })

  Results.ActionsView = Marionette.ItemView.extend({
    template: '[data-template-name=actions]',
    className: 'actions',

    events: {
      'click [data-start]': 'start'
    },

    modelEvents: {
      'change:status': 'render'
    },

    start: function () {
      this.model.start()
      return false
    }
  })

  Results.CardView = Marionette.ItemView.extend({
    template: '[data-template-name=card]',

    tagName: 'li',

    events: {
      'click a': 'select'
    },

    modelEvents: {
      'change:selected': 'onChangeSelected'
    },

    select: function () {
      this.model.set({selected: !this.model.get('selected')})
      return false
    },

    onChangeSelected: function (model, value) {
      this.$el.toggleClass('selected', value)
    }
  })

  Results.CardsView = Marionette.CollectionView.extend({
    itemView: Results.CardView,

    tagName: 'ul',
    className: 'cards'
  })

  Results.PlayerCardView = Marionette.ItemView.extend({
    template: '[data-template-name=player-card]',

    tagName: 'li',

    events: {
      'click a': 'noop'
    },

    modelEvents: {
      'change': 'render'
    },

    noop: function () { return false }
  })

  Results.EmptyPlayerCardsView = Marionette.ItemView.extend({
    template: '[data-template-name=empty-results]',

    tagName: 'li',
    className: 'empty'
  })

  Results.PlayerCardsView = Marionette.CollectionView.extend({
    itemView: Results.PlayerCardView,
    emptyView: Results.EmptyPlayerCardsView,

    tagName: 'ul',
    className: 'cards',

    onRender: function () {
      this.$el.tooltip({ selector: '[data-toggle=tooltip]' })
    }
  })

  Results.addInitializer(function () {
    var $gameAreaElement = $('.game-area'),
        room = new Results.Room($gameAreaElement.data('room-attributes')),
        game = new Results.Game({ room: room }),
        usersView   = new Results.UsersView({ collection: game.players }),
        actionsView = new Results.ActionsView({ model: game }),
        cardsView   = new Results.CardsView({ collection: game.cards })
        playerCardsView = new Results.PlayerCardsView({ collection: game.selectedPlayerCards })

    LiveEstimationPoker.addRegions({
      usersRegion: '.users-container',
      actionsRegion: '.actions-container',
      messagesRegion: '.messages',
      cardsRegion: '.cards-container',
      playerCardsRegion: '.player-cards-container',
      gameRegion: ".game-area"
    })

    LiveEstimationPoker.game = game
    LiveEstimationPoker.usersRegion.show(usersView)
    LiveEstimationPoker.actionsRegion.show(actionsView)
    LiveEstimationPoker.cardsRegion.show(cardsView)
    LiveEstimationPoker.playerCardsRegion.show(playerCardsView)
  })
})