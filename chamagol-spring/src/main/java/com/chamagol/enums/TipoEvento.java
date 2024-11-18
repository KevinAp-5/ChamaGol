package com.chamagol.enums;

public enum TipoEvento {
    /*
     * Exemplos de tipoEvento:
     * DICA: Um sinal enviado pelo mestre (por exemplo, "Aposte no próximo gol do Time A").
     * GOL: Um gol marcado durante a partida.
     * CARTÃO: Cartão amarelo ou vermelho recebido por um jogador.
     * FINALIZADO: Indica que o jogo terminou.
     * ALERTA: Mensagem administrativa (por exemplo, "Manutenção programada no sistema").
     * PRO: Um sinal exclusivo para usuários PRO.
     */

    DICA("DICA"),
    GOL("GOL"),
    CARTAO("CARTAO"),
    ALERTA("ALERTA"),
    PRO("PRO");

    private String tipo;

    private TipoEvento(String tipo) {
        this.tipo = tipo;
    }

    public String getTipo() {
        return this.tipo;
    }

    @Override
    public String toString() {
        return this.getTipo();
    }
}
