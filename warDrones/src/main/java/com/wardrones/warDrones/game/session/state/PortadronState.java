package com.wardrones.warDrones.game.session.state;

import java.util.List;

import com.wardrones.warDrones.model.enums.Bando;

public class PortadronState {

    private int id;         //no cambia, a revisar
    private int partidaId;  //no cambia, a revisar
    private Bando tipo;     //no cambia y quizas ni deba ser de tipo Bando, a revisar
    private int x;
    private int y;
    private boolean estado;
    private int vida;

    private int ataqueBase; //es una constante, seria para definir el ataque de sus drones, a revisar
    private int movimientoBase; //es una constante, seria para definir el movimiento de sus drones, a revisar

    //listado de ids de drones 
    private List<Integer> listadoDronesIds;

    //aca iria constructora/funcion para crear el objeto con los datos obtenidos desde la base de datos mediante la clase Portadron o definirla en otra clase (ya sea esta, service o gamesession)
    public PortadronState () {}

    //selectoras
    public int getId() {
        return id;
    }

    public int getPartidaId() {
        return partidaId;
    }

    public Bando getTipoDePortadron() {
        return tipo;
    }

    public int getPosicionX() {
        return x;
    }

    public int getPosicionY() {
        return y;
    }

    public boolean getEstado() {
        return estado;
    }

    public int getVida() {
        return vida;
    }

    public int getAtaqueBase() {
        return ataqueBase;
    }

    public int getMovimientoBase() {
        return movimientoBase;
    }

    //getlistadodronesid
}

