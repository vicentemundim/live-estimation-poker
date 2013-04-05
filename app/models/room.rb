class Room
  include Mongoid::Document
  include Mongoid::Timestamps

  field :token

  before_save :generate_token

  def to_param
    token
  end

  class << self
    def by_token(token)
      find_by(token: token)
    end
  end

  private
    def generate_token
      self.token = SecureRandom.hex(2)
    end
end