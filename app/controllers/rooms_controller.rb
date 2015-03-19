class RoomsController < ApplicationController
  inherit_resources
  respond_to :json

  defaults finder: :by_token

  def join
    redirect_to Room.by_token(params[:room][:token])
  rescue Mongoid::Errors::DocumentNotFound
    flash[:alert] = "There is no room with the given code"
    redirect_to root_path
  end

  private

    def collection
      @rooms ||= super.limit(params[:limit] || 10)
    end
end
