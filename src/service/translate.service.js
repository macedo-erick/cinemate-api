import translateModule from 'translate';

const TranslateService = () => {
  const translate = async (phrase, capitalize = false) => {
    let result = await translateModule(phrase, 'pt');

    if (capitalize) {
      result = result
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase().concat(word.substring(1)))
        .join(' ');
    }

    return result;
  };

  return {
    translate,
  };
};

export default TranslateService();
