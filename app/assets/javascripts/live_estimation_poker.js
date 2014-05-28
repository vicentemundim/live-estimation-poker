var app = angular.module('LiveEstimationPoker', ['doowb.angular-pusher'])

app.config(['PusherServiceProvider', function (PusherServiceProvider) {
    PusherServiceProvider.setToken(angular.element('#pusher_api_key').val())
  }])
  .service('Game', ['Pusher', 'PusherService', function(Pusher, PusherService) {
    Pusher.trigger = function (channelName, eventName, data) {
      PusherService.then(function (pusher) {
        var channel = pusher.channel(channelName)

        if (channel) {
          channel.trigger(eventName, data || {})
        }
      })
    }

    return {
      initialize: function (token, cards) {
        var self = this

        this.token = token
        this.channel = 'presence-' + this.token

        this.selectedPlayerCards = []
        this.players = []

        this.cards = cards.map(function (card) {
          return { value: card }
        })

        Pusher.subscribe(this.channel, 'pusher:subscription_succeeded', function (members) {
          self.me = members.me
          self.players = members.members
        })

        // We just need to subscribe, so that digest is called when those events happen
        Pusher.subscribe(this.channel, 'pusher:member_added')
        Pusher.subscribe(this.channel, 'pusher:member_removed')

        Pusher.subscribe(this.channel, 'client-game-started', function () {
          self.start(true)
        })

        Pusher.subscribe(this.channel, 'client-game-ended', function () {
          self.end(true)
        })

        Pusher.subscribe(this.channel, 'client-player-updated', function (playerWithCard) {
          self.playerUpdated(playerWithCard)
        })
      },

      start: function (silent) {
        this.started = true

        angular.forEach(this.players, function (player, id) {
          delete player.selected
          delete player.card
        })

        angular.forEach(this.cards, function (card) {
          delete card.selected
        })

        if (!silent) {
          Pusher.trigger(this.channel, 'client-game-started')
        }
      },

      end: function (silent) {
        this.started = false

        if (!silent) {
          Pusher.trigger(this.channel, 'client-game-ended')
        }
      },

      playerUpdated: function (data) {
        angular.forEach(this.players, function (player, id) {
          if (id == data.id) {
            angular.extend(player, data.info)
          }
        })

        if (this.allPlayersSelected()) {
          this.end()
        }
      },

      allPlayersSelected: function () {
        var all = true

        angular.forEach(this.players, function (player, id) {
          if (!player.selected) {
            all = false
          }
        })

        return all
      },

      toggle: function (card) {
        if (this.started) {
          angular.forEach(this.cards, function (card) {
            card.selected = false
          })

          this.me.info.selected = card.selected = true
          this.me.info.card = card.value

          Pusher.trigger(this.channel, 'client-player-updated', this.me)
        }
      }
    }
  }])
  .controller('ConnectedUsersController', ['$scope', 'Game', function($scope, Game) {
    $scope.game = Game
  }])
  .controller('ActionsController', ['$scope', 'Game', function($scope, Game) {
    $scope.game = Game
  }])
  .controller('GameController', ['$scope', 'Game', '$element', function($scope, Game, $element) {
    var room = $element.data('room-attributes')

    $scope.game = Game
    $scope.game.initialize(room.token, room.cards)
  }])
