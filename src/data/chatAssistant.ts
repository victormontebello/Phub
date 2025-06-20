export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    question: "Como faço para confirmar meu e-mail?",
    answer: "Após o cadastro, enviamos um link de confirmação para o seu e-mail. Basta clicar nesse link para validar sua conta e obter acesso total à plataforma."
  },
  {
    question: "Esqueci minha senha, e agora?",
    answer: "Não se preocupe! Na tela de login, clique na opção 'Esqueci minha senha'. Iremos te guiar pelo processo de recuperação por e-mail."
  },
  {
    question: "Como altero meus dados cadastrais?",
    answer: "Dentro do seu perfil, você encontrará a opção para editar suas informações, como nome, telefone e foto."
  },
  {
    question: "O que é CVI e por que preciso dele?",
    answer: "O CVI (Certificado Veterinário Internacional) é necessário para veterinários que desejam se cadastrar na plataforma. Ele comprova sua licença para exercer a profissão."
  }
]; 