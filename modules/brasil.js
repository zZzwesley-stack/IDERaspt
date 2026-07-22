// =====================================================
// RastPt Module - Brasil.js
// Módulo com funções brasileiras para RastPt
// =====================================================

const Brasil = {

    nome: "Brasil",

    versao: "1.0.0",

    autor: "RastPt Team",

    // Informações básicas
    pais() {
        return "Brasil";
    },

    idioma() {
        return "Português Brasileiro";
    },

    saudacao() {
        return "Olá, meu Brasil!";
    },


    // Estados brasileiros
    estados() {
        return [
            "Alagoas",
            "Pernambuco",
            "São Paulo",
            "Minas Gerais",
            "Rio de Janeiro",
            "Bahia",
            "Paraná",
            "Santa Catarina",
            "Rio Grande do Sul"
        ];
    },


    // Moeda
    moeda(valor) {
        return `R$ ${Number(valor).toFixed(2)}`;
    },


    // Mensagem personalizada
    falar(texto) {
        return String(texto);
    },


    // Data no padrão brasileiro
    dataAtual() {
        return new Date().toLocaleDateString("pt-BR");
    },


    // Hora brasileira
    horaAtual() {
        return new Date().toLocaleTimeString("pt-BR");
    }

};


// Exporta para o interpretador RastPt
if (typeof module !== "undefined") {
    module.exports = Brasil;
}
