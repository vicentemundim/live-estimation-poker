class UserSerializer < ActiveModel::Serializer
  attributes :id, :authentication_token, :email, :name

  def id
    object.id.to_s
  end
end
