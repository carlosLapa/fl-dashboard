INSERT INTO tb_user (first_name, last_name, funcao, cargo, email, password, profile_image) VALUES ('Carlos', 'Lapa', 'Programador Informático', 'Sócio', 'carlos@gmail.com', '1234', NULL);
INSERT INTO tb_user (first_name, last_name, funcao, cargo, email, password, profile_image) VALUES ('José', 'Lapa', 'Engenheiro Civil', 'Diretor-Geral', 'jose@gmail.com', '1234', NULL);

INSERT INTO tb_role (authority) VALUES ('ROLE_OPERATOR');
INSERT INTO tb_role (authority) VALUES ('ROLE_ADMIN');

INSERT INTO tb_projeto (projeto_ano, designacao, entidade, prioridade, observacao, prazo) VALUES (2023, 'P-01 Lidl Alcântara', 'Lidl', 'Média', 'Falar com o responsável de loja', TIMESTAMP WITH TIME ZONE '2024-07-13T20:50:07.12345Z');

INSERT INTO tb_departamento (designacao, descricao) VALUES ('Projeto', 'Departamento encarregue da concepção e elaboração de projetos de engenharia civil');

INSERT INTO tb_especialidade (tipo, descricao) VALUES ('Engenharias', 'Elaboração de projetos estruturais');

INSERT INTO tb_tarefa (descricao, prioridade) VALUES ('Elaborar relatório preliminar', 'Urgente/Elevada');
