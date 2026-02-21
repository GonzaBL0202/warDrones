package com.wardrones.warDrones.model.dto.request;

public class MovimientoPortadronRequest {

    private int portadronId;
    private int x;
    private int y;

     public int getPortaDronId(){
        return portadronId;
    }

    public int getX(){
        return x;
    }

    public int getY(){
        return y;
    }

    public int getPortadronId() {
        return portadronId;
    }

    public void setPortadronId(int portadronId) {
        this.portadronId = portadronId;
    }

    public void setX(int x) {
        this.x = x;
    }

    public void setY(int y) {
        this.y = y;
    }
}
