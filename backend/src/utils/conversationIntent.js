const GREETINGS = [
  'bonjour',
  'bonsoir',
  'salut',
  'hello',
  'hi',
  'coucou',
  'bjr',
  'slt'
]

const THANKS = [
  'merci',
  'merci beaucoup',
  'thanks',
  'thank you',
  'super merci',
  'parfait merci'
]

const ACKS = [
  'ok',
  'okay',
  'daccord',
  "d'accord",
  'dac',
  'entendu',
  'compris',
  'parfait',
  'tres bien',
  'très bien',
  'bien recu',
  'bien reçu'
]

const GOODBYES = [
  'au revoir',
  'a bientot',
  'à bientôt',
  'bye',
  'bonne journee',
  'bonne journée',
  'bonne soiree',
  'bonne soirée',
  'a plus',
  'à plus'
]

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.!?,;:]/g, '')
    .replace(/\s+/g, ' ')
}

function exactOrShortMatch(text, list) {
  const value = normalize(text)
  return list.some((item) => value === normalize(item))
}

export function detectConversationIntent(text) {
  const value = normalize(text)

  if (!value) return { type: 'empty' }

  if (exactOrShortMatch(value, GREETINGS)) {
    return {
      type: 'greeting',
      answer:
        "Bonjour. Je suis le copilote interne de la banque. Posez-moi une question sur les procédures, documents ou informations internes accessibles à votre niveau."
    }
  }

  if (exactOrShortMatch(value, THANKS)) {
    return {
      type: 'thanks',
      answer:
        "Avec plaisir. Je reste disponible si vous avez une autre question sur les informations internes de la banque."
    }
  }

  if (exactOrShortMatch(value, ACKS)) {
    return {
      type: 'ack',
      answer:
        "Très bien. N’hésitez pas à me poser une autre question si besoin."
    }
  }

  if (exactOrShortMatch(value, GOODBYES)) {
    return {
      type: 'goodbye',
      answer:
        "Au revoir. Je reste disponible pour toute autre recherche d’information interne."
    }
  }

  return { type: 'question' }
}