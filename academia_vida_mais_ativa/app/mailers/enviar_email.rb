class EnviarEmail < ActionMailer::Base
  default to: 'vidamaisativa@hotmail.com'

    def mandar_email(nome, email, titulo, descricao)
      @nome = nome
      @email = email
      @titulo = titulo
      @descricao = descricao
      mail(from: @email, toname: @nome, subject: @titulo, text: @descricao)  
    end
end
