class Room
  include Mongoid::Document
  include Mongoid::Timestamps

  field :token
  field :cards, type: Array, default: ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?']

  before_create :generate_token

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