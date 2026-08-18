package com.fl.dashboard.projections;

public interface UserDetailsProjection {

    String getUsername();

    String getPassword();

    Boolean getAtivo();

    Long getRoleId();

    String getAuthority();
}
