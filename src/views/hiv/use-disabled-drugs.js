import useLocation from 'found/useLocation';


export default function useDisabledDrugs() {
  const {state: {disabledDrugs = []} = {}} = useLocation();
  return disabledDrugs;
}
