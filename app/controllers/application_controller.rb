require "application_responder"

class ApplicationController < ActionController::Base
  self.responder = ApplicationResponder
  respond_to :html

  before_filter :authenticate_user!

  helper_method :gravatar_url

  protect_from_forgery

  protected
    def gravatar_url(options={})
      options.reverse_merge({size: 60, default: 'monsterid'})

      "http://www.gravatar.com/avatar/#{Digest::MD5.hexdigest(current_user.email)}?s=#{options[:size]}&d=#{options[:default]}"
    end
end
