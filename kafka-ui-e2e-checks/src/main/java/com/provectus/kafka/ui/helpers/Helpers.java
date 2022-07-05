package com.provectus.kafka.ui.helpers;



public class Helpers {
    public static final Helpers INSTANCE = new Helpers();

    private Helpers(){}

    public ApiHelper apiHelper = new ApiHelper();
}
