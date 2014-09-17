class ApplicationController < ActionController::Base
  require 'koala'
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def index
    @graph = Koala::Facebook::GraphAPI.new(access_token)
    # 1.2 and later
    @graph = Koala::Facebook::API.new(access_token)
    @graph.put_picture(file, content_type, facebook_arguments = {}, user_or_album_id, http_options = {})
    # so for instance
    @graph.put_picture(file, content_type, {:message => "My upload message"}, "me")
    @graph.put_picture(params[:file], {:message => "Message"}, my_album_id)
  end

end
