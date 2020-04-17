import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import MetaStore from '~/store/meta';

// eslint-disable-next-line import/no-mutable-exports
let metaStore!: MetaStore;

function initialiseStores(store: Store<any>): void {
  metaStore = getModule(MetaStore, store);
}

export {
  initialiseStores,
  metaStore,
};
