class User
  include Mongoid::Document

  def self.omniauth_providers
    providers = []
    providers << :facebook      if ENV['FACEBOOK_APP_ID'] && ENV['FACEBOOK_APP_SECRET']
    providers << :google_oauth2 if ENV['GOOGLE_APP_ID'] && ENV['GOOGLE_APP_SECRET']
    providers << :github        if ENV['GITHUB_APP_ID'] && ENV['GITHUB_APP_SECRET']
    providers
  end

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable, omniauth_providers: omniauth_providers

  field :name, type: String

  ## Database authenticatable
  field :email,              type: String, default: ""
  field :encrypted_password, type: String, default: ""

  ## Recoverable
  field :reset_password_token,   type: String
  field :reset_password_sent_at, type: Time

  ## Rememberable
  field :remember_created_at, type: Time

  ## Trackable
  field :sign_in_count,      type: Integer, default: 0
  field :current_sign_in_at, type: Time
  field :last_sign_in_at,    type: Time
  field :current_sign_in_ip, type: String
  field :last_sign_in_ip,    type: String

  ## Confirmable
  # field :confirmation_token,   type: String
  # field :confirmed_at,         type: Time
  # field :confirmation_sent_at, type: Time
  # field :unconfirmed_email,    type: String # Only if using reconfirmable

  ## Lockable
  # field :failed_attempts, type: Integer, default: 0 # Only if lock strategy is :failed_attempts
  # field :unlock_token,    type: String # Only if unlock strategy is :email or :both
  # field :locked_at,       type: Time

  ## Token Authenticatable
  acts_as_token_authenticatable
  field :authentication_token

  field :provider, type: String
  field :uid, type: String
  field :avatar_url, type: String

  before_save :update_avatar

  validates :name, presence: true

  def self.find_for_facebook_oauth(auth, signed_in_resource=nil)
    User.or({ provider: auth.provider, uid: auth.uid }, { email: auth.info.email }).first_or_initialize.tap do |user|
      user.name = auth.info.name
      user.provider = auth.provider
      user.uid = auth.uid
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20] if user.encrypted_password.blank?
      user.avatar_url = auth.info.image
      user.save
    end
  end

  def self.find_for_google_oauth2(auth, signed_in_resource=nil)
    find_for_facebook_oauth(auth, signed_in_resource)
  end

  def self.find_for_github(auth, signed_in_resource=nil)
    find_for_facebook_oauth(auth, signed_in_resource)
  end

  protected
    def update_avatar
      self.avatar_url = gravatar_url if avatar_url.blank?
    end

    def gravatar_url(options={})
      options.reverse_merge({size: 60, default: 'monsterid'})

      "http://www.gravatar.com/avatar/#{Digest::MD5.hexdigest(email)}?s=#{options[:size]}&d=#{options[:default]}"
    end
end
