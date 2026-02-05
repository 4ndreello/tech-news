export enum ErrorType {
  Network = 'network',
  Timeout = 'timeout',
  ServerError = 'server',
  NotFound = 'notfound',
  Unknown = 'unknown',
}

export function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('failed to fetch')) {
    return ErrorType.Network;
  }
  if (message.includes('timeout') || message.includes('aborted')) {
    return ErrorType.Timeout;
  }
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return ErrorType.ServerError;
  }
  if (message.includes('404')) {
    return ErrorType.NotFound;
  }
  return ErrorType.Unknown;
}

export function getErrorMessage(type: ErrorType) {
  const messages = {
    [ErrorType.Network]: {
      title: 'Sem conexão com a internet',
      message: 'Verifique sua conexão e tente novamente.',
      suggestion: 'Verifique se está conectado à internet',
    },
    [ErrorType.Timeout]: {
      title: 'Tempo de espera esgotado',
      message: 'O servidor demorou muito para responder.',
      suggestion: 'Tente novamente em alguns segundos',
    },
    [ErrorType.ServerError]: {
      title: 'Erro no servidor',
      message: 'Nossos servidores estão com problemas temporários.',
      suggestion: 'Tente novamente mais tarde',
    },
    [ErrorType.NotFound]: {
      title: 'Conteúdo não encontrado',
      message: 'O recurso solicitado não existe.',
      suggestion: 'Verifique o endereço ou volte à página inicial',
    },
    [ErrorType.Unknown]: {
      title: 'Ops, algo deu errado',
      message: 'Encontramos um erro inesperado.',
      suggestion: 'Tente recarregar a página',
    },
  };

  return messages[type];
}

export function shouldRetry(type: ErrorType): boolean {
  return [ErrorType.Network, ErrorType.Timeout, ErrorType.ServerError].includes(type);
}
