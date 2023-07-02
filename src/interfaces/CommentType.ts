type CommentWithUserId = {
    _id: string;
    userId: string;
    usuario?: never; // Nunca puede existir si userId está presente
    texto: string;
    date: Date;
  };
  
  type CommentWithUsuario = {
    _id: string;
    userId?: never; // Nunca puede existir si usuario está presente
    usuario: {
      _id: string;
      nombre: string;
      apellidos: string;
    };
    texto: string;
    date: Date;
  };
  
  type CommentType = CommentWithUserId | CommentWithUsuario;
  
  export default CommentType;
  