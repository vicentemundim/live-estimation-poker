class RoomsController < ApplicationController
  inherit_resources

  defaults finder: :by_token

  def join
    redirect_to Room.by_token(params[:room][:token])
  rescue Mongoid::Errors::DocumentNotFound
    flash[:alert] = "There is no room with the given code"
    redirect_to root_path
  end
end
