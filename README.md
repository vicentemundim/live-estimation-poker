# Live Estimation Poker

A planning poker application with real-time results.

## Running

You'll will need a [Pusher](http://pusher.com) application setup in order to run the Live Estimation Poker application. Just create one, and configure the APP_ID, KEY and SECRET in a `.env` file:

```
RACK_ENV=development

PUSHER_APP_ID=38536
PUSHER_APP_SECRET=c9571b53d36275da91a7
PUSHER_APP_KEY=c782770d3d18b6d08412
```

Now you can just run the application with `foreman start`.

If you want to enable facebook, google or github integration you will need to create applications in each of these providers, and set their APP_ID and APP_SECRET as environment variables.

You can add them to the `.env` file, and run the application with `foreman start`:

```
FACEBOOK_APP_ID=<ID>
FACEBOOK_APP_SECRET=<SECRET>

GOOGLE_APP_ID=<ID>
GOOGLE_APP_SECRET=<SECRET>

GITHUB_APP_ID=<ID>
GITHUB_APP_SECRET=<SECRET>
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License

[MIT-LICENSE](https://github.com/vicentemundim/live-estimation-poker/blob/master/LICENSE.txt)