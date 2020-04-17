import { Module, VuexModule, Mutation } from 'vuex-module-decorators';

@Module({
  name: 'meta',
  stateFactory: true,
  namespaced: true,
})
export default class MetaStore extends VuexModule {
  private _header: string = 'Welcome';

  get header(): string {
    return this._header;
  }

  @Mutation
  changeHeader(header: string): void {
    this._header = header;
  }
}
