class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def index
  end

  def mandar_email_contato
    begin
      EnviarEmail.mandar_email(params["nome"], params["email"], params["titulo"], params["descricao"]).deliver
      flash[:notice] = "E-mail enviado, com sucesso!"
    rescue => exception
      flash[:error] = "Falha no envio do e-mail!"
      puts "Ocorreu um erro do tipo #{exception.class}: #{exception}"
    end  
    redirect_to "/contato"
  end
end
