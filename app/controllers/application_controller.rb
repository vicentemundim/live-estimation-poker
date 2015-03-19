require "application_responder"

class ApplicationController < ActionController::Base
  self.responder = ApplicationResponder
  respond_to :html, :json

  acts_as_token_authentication_handler_for User

  before_filter :authenticate_user!

  protect_from_forgery
  skip_before_action :verify_authenticity_token, if: :valid_api_request?

  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) << :name
  end

  def valid_api_request?
    api_tokens.include?(request.headers['HTTP_X_API_TOKEN'])
  end

  def api_tokens
    (ENV['API_TOKENS'].presence || (Rails.env.production? ? '' : 'dev, test')).split(',').map(&:strip)
  end
end
