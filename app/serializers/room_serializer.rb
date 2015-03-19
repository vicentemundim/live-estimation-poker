class RoomSerializer < ActiveModel::Serializer
  attributes :id, :token, :cards, :created_at

  def id
    object.id.to_s
  end
end
