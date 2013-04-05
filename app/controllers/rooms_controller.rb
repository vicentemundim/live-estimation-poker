class RoomsController < ApplicationController
  inherit_resources

  defaults finder: :by_token
end
