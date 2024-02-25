import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakController } from './keycloak.controller';
import { KeycloakService } from './keycloak.service';

describe('KeycloakController', () => {
  let controller: KeycloakController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeycloakController],
      providers: [KeycloakService],
    }).compile();

    controller = module.get<KeycloakController>(KeycloakController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
